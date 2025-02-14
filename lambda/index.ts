// typeを付けないとうまく動かない
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda/trigger/lambda-function-url'
import { S3, GetObjectCommand } from '@aws-sdk/client-s3'

export const handler = async function (event: LambdaFunctionURLEvent) {
  console.log(event);
  console.log(`node version is ${process.version}`);
  
  console.log(`PATH is ${process.env.PATH || 'undefined'}`);
  console.log(`NODE_PATH is ${process.env.NODE_PATH || 'undefined'}`);
  console.log(`LD_LIBRARY_PATH is ${process.env.LD_LIBRARY_PATH || 'undefined'}`);
  
  const s3 = new S3({
    region: process.env.DEPLOY_REGION,
  });
  
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: process.env.S3_KEY_NAME,
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

// module.exports = { handler }

// handler({} as unknown as LambdaFunctionURLEvent).then(() => {
//   console.log('done');
// });