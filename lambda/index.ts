// typeを付けないとうまく動かない
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda/trigger/lambda-function-url'
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME_DEFAULT = 'tower-of-druaga'
const TABLE_REGION_DEFAULT = 'ap-northeast-1'

export const handler = async function (event: LambdaFunctionURLEvent) {
  console.log(event);
  console.log(`node version is ${process.version}`);
  
  console.log(`PATH is ${process.env.PATH || 'undefined'}`);
  console.log(`NODE_PATH is ${process.env.NODE_PATH || 'undefined'}`);
  console.log(`LD_LIBRARY_PATH is ${process.env.LD_LIBRARY_PATH || 'undefined'}`);
  
  // const client = new DynamoDBClient({
  //   region: process.env.TABLE_REGION || TABLE_REGION_DEFAULT,
  // });
  // const docClient = DynamoDBDocumentClient.from(client);
  
  // const command = new ScanCommand({
  //   TableName: process.env.TABLE_NAME || TABLE_NAME_DEFAULT,
  // });

  // const output = await docClient.send(command);
  const output = '';
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