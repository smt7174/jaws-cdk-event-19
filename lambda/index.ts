// typeを付けないとうまく動かない
import type { LambdaFunctionURLEvent, LambdaFunctionURLResult } from 'aws-lambda/trigger/lambda-function-url'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb/dist-types/DynamoDBDocumentClient";
import { ScanCommand } from "@aws-sdk/lib-dynamodb/dist-types/commands/ScanCommand";

const TABLE_REGION_DEFAULT = 'ap-northeast-1'

const handler = async function (event: LambdaFunctionURLEvent) {
  console.log(event);
  console.log(`node version is ${process.version}`);
  
  const client = new DynamoDBClient({
    region: process.env.TABLE_REGION || TABLE_REGION_DEFAULT,
  });
  const docClient = DynamoDBDocumentClient.from(client);
  
  const command = new ScanCommand({
    TableName: process.env.TABLE_NAME,
  });

  const output = await docClient.send(command);
  console.log(output);
  
  const result: LambdaFunctionURLResult = {
    statusCode: 200,
    body: JSON.stringify({
      output,
    }),
  };

  console.log(result);
  return result;
};

module.exports = { handler }

// handler({} as unknown as LambdaFunctionURLEvent).then(() => {
//   console.log('done');
// });