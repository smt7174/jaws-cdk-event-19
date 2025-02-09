import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda/trigger/lambda-function-url'

const handler = async function (event: LambdaFunctionURLEvent) {
  console.log(event);
  
  const result: LambdaFunctionURLResult = {
    statusCode: 200,
    body: JSON.stringify({
      message: `node version is ${process.version}`
    }),
  };

  console.log(result);
  return result;
};

module.exports = { handler }

// handler({} as unknown as LambdaFunctionURLEvent).then(() => {
//   console.log('done');
// });