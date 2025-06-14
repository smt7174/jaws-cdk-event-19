// 参考：https://github.com/lambci/node-custom-lambda/blob/master/v12.x/bootstrap.js
const http = require('http');
const fs = require('fs');

const RUNTIME_PATH = '/2018-06-01/runtime'
const CALLBACK_USED = Symbol('CALLBACK_USED')
const EXTENSION_TYPESCRIPT = '.ts'
const EXTENSION_JAVASCRIPT = '.js'
const EXTENSION_JAVASCRIPT_MODULE = '.mjs'

const {
  AWS_LAMBDA_FUNCTION_NAME,
  AWS_LAMBDA_FUNCTION_VERSION,
  AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
  AWS_LAMBDA_LOG_GROUP_NAME,
  AWS_LAMBDA_LOG_STREAM_NAME,
  LAMBDA_TASK_ROOT,
  _HANDLER,
  AWS_LAMBDA_RUNTIME_API,
  PATH,
  NODE_PATH
} = process.env

const [HOST, PORT] = AWS_LAMBDA_RUNTIME_API.split(':')

start()

async function start() {
  let handler
  console.log(`runtime.js PATH env is ${PATH}`)
  console.log(`runtime.js NODE_PATH env is ${NODE_PATH}`)
  try {
    handler = getHandler()
  } catch (e) {
    await initError(e)
    return process.exit(1)
  }
  tryProcessEvents(handler)
}

async function tryProcessEvents(handler) {
  try {
    await processEvents(handler)
  } catch (e) {
    console.error(e)
    return process.exit(1)
  }
}

async function processEvents(handler) {
  while (true) {
    const { event, context } = await nextInvocation()

    let result
    try {
      result = await handler(event, context)
    } catch (e) {
      await invokeError(e, context)
      continue
    }
    const callbackUsed = context[CALLBACK_USED]

    await invokeResponse(result, context)

    if (callbackUsed && context.callbackWaitsForEmptyEventLoop) {
      return process.prependOnceListener('beforeExit', () => tryProcessEvents(handler))
    }
  }
}

function initError(err) {
  return postError(`${RUNTIME_PATH}/init/error`, err)
}

async function nextInvocation() {
  const res = await request({ path: `${RUNTIME_PATH}/invocation/next` })

  if (res.statusCode !== 200) {
    throw new Error(`Unexpected /invocation/next response: ${JSON.stringify(res)}`)
  }

  if (res.headers['lambda-runtime-trace-id']) {
    process.env._X_AMZN_TRACE_ID = res.headers['lambda-runtime-trace-id']
  } else {
    delete process.env._X_AMZN_TRACE_ID
  }

  const deadlineMs = +res.headers['lambda-runtime-deadline-ms']

  let context = {
    awsRequestId: res.headers['lambda-runtime-aws-request-id'],
    invokedFunctionArn: res.headers['lambda-runtime-invoked-function-arn'],
    logGroupName: AWS_LAMBDA_LOG_GROUP_NAME,
    logStreamName: AWS_LAMBDA_LOG_STREAM_NAME,
    functionName: AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: AWS_LAMBDA_FUNCTION_VERSION,
    memoryLimitInMB: AWS_LAMBDA_FUNCTION_MEMORY_SIZE,
    getRemainingTimeInMillis: () => deadlineMs - Date.now(),
    callbackWaitsForEmptyEventLoop: true,
  }

  if (res.headers['lambda-runtime-client-context']) {
    context.clientContext = JSON.parse(res.headers['lambda-runtime-client-context'])
  }

  if (res.headers['lambda-runtime-cognito-identity']) {
    context.identity = JSON.parse(res.headers['lambda-runtime-cognito-identity'])
  }

  const event = JSON.parse(res.body)

  return { event, context }
}

async function invokeResponse(result, context) {
  const res = await request({
    method: 'POST',
    path: `${RUNTIME_PATH}/invocation/${context.awsRequestId}/response`,
    body: JSON.stringify(result === undefined ? null : result),
  })
  if (res.statusCode !== 202) {
    throw new Error(`Unexpected /invocation/response response: ${JSON.stringify(res)}`)
  }
}

function invokeError(err, context) {
  return postError(`${RUNTIME_PATH}/invocation/${context.awsRequestId}/error`, err)
}

async function postError(path, err) {
  const lambdaErr = toLambdaErr(err)
  const res = await request({
    method: 'POST',
    path,
    headers: {
      'Content-Type': 'application/json',
      'Lambda-Runtime-Function-Error-Type': lambdaErr.errorType,
    },
    body: JSON.stringify(lambdaErr),
  })
  if (res.statusCode !== 202) {
    throw new Error(`Unexpected ${path} response: ${JSON.stringify(res)}`)
  }
}

function getHandler() {
  const appParts = _HANDLER.split('.')

  if (appParts.length !== 2) {
    throw new Error(`Bad handler ${_HANDLER}`)
  }

  const [modulePath, handlerName] = appParts

  // Let any errors here be thrown as-is to aid debugging
  // デフォルトは*.jsファイルを読み込むので、'ts'拡張子を設定しないと
  // Runtime.Unknownエラーになる。
  let filePath = "";
  if (isExistFile(LAMBDA_TASK_ROOT + '/' + modulePath + EXTENSION_TYPESCRIPT)) {
    filePath = LAMBDA_TASK_ROOT + '/' + modulePath + EXTENSION_TYPESCRIPT;
  } else if (isExistFile(LAMBDA_TASK_ROOT + '/' + modulePath + EXTENSION_JAVASCRIPT_MODULE)) {
    filePath = LAMBDA_TASK_ROOT + '/' + modulePath + EXTENSION_JAVASCRIPT_MODULE;
  } else {
    filePath = LAMBDA_TASK_ROOT + '/' + modulePath + EXTENSION_JAVASCRIPT;
  }

  const app = require(filePath);
  // const app = require(LAMBDA_TASK_ROOT + '/' + modulePath)

  const userHandler = app[handlerName]

  if (userHandler == null) {
    throw new Error(`Handler '${handlerName}' missing on module '${modulePath}'`)
  } else if (typeof userHandler !== 'function') {
    throw new Error(`Handler '${handlerName}' from '${modulePath}' is not a function`)
  }

  return (event, context) => new Promise((resolve, reject) => {
    context.succeed = resolve
    context.fail = reject
    context.done = (err, data) => err ? reject(err) : resolve(data)

    const callback = (err, data) => {
      context[CALLBACK_USED] = true
      context.done(err, data)
    }

    let result
    try {
      result = userHandler(event, context, callback)
    } catch (e) {
      return reject(e)
    }
    if (result != null && typeof result.then === 'function') {
      result.then(resolve, reject)
    }
  })
}

function request(options) {
  options.host = HOST
  options.port = PORT

  return new Promise((resolve, reject) => {
    let req = http.request(options, res => {
      let bufs = []
      res.on('data', data => bufs.push(data))
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(bufs).toString(),
      }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.end(options.body)
  })
}

function toLambdaErr(err) {
  const { name, message, stack } = err
  return {
    errorType: name || typeof err,
    errorMessage: message || ('' + err),
    stackTrace: (stack || '').split('\n').slice(1),
  }
}

function isExistFile(filePath) {
  try {
    fs.statSync(filePath);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
}