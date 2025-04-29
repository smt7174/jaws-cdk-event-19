// typeを付けないとうまく動かない
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda/trigger/lambda-function-url'
// import { execSync } from 'child_process';

import { S3, GetObjectCommand } from '@aws-sdk/client-s3'
// import { S3, GetObjectCommand } from '/opt/lib/nodejs/node_modules/@aws-sdk/client-s3'

export const handler = async function (event: LambdaFunctionURLEvent) {
  console.log(event);
  console.log(`node version is ${process.version}`);
  
  console.log(`PATH is ${process.env.PATH || 'undefined'}`);
  console.log(`NODE_PATH is ${process.env.NODE_PATH || 'undefined'}`);
  console.log(`LD_LIBRARY_PATH is ${process.env.LD_LIBRARY_PATH || 'undefined'}`);
  
  const s3 = new S3({
    region: process.env.DEPLOY_REGION || 'us-east-1',
  });
  
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME || 'jp.belltreesoft.suzukima.jaws-cdk-event-19-sample',
    Key: process.env.S3_KEY_NAME || 'aws-cdk-event-19-sample.txt',
  });
  
  const response = await s3.send(getObjectCommand);
  const output = await response.Body?.transformToString();
  // const output = '';
  
  console.log(output);
  
  const result: LambdaFunctionURLResult = {
    statusCode: 200,
    body: JSON.stringify({
      output
    }),
  };

  console.log(result);
  return result;
};

// export const handler = async function (event: LambdaFunctionURLEvent) {
//   console.log(event);
//   console.log(`node version is ${process.version}`);
  
//   console.log(`PATH is ${process.env.PATH || 'undefined'}`);
//   console.log(`NODE_PATH is ${process.env.NODE_PATH || 'undefined'}`);
//   console.log(`LD_LIBRARY_PATH is ${process.env.LD_LIBRARY_PATH || 'undefined'}`);
  
//   const pwd = execSync('pwd');
//   console.log(`pwd: ${pwd.toString()}`);

//   const ls = execSync('ls -al /opt/lib');
//   console.log(`ls: ${ls.toString()}`);
  
//   const result: LambdaFunctionURLResult = {
//     statusCode: 200,
//     body: JSON.stringify({
//       'message': 'OK'
//     }),
//   };

//   console.log(result);
//   return result;
// };

// handler({} as unknown as LambdaFunctionURLEvent).then(() => {
//   console.log('done');
// });