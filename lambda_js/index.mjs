import { DynamoDBClient } from "@aws-sdk/client-dynamodb/dist-cjs/index";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME_DEFAULT = 'tower-of-druaga'
const TABLE_REGION_DEFAULT = 'ap-northeast-1'

export const handler = async function (event) {
  console.log(event);
  console.log(`node version is ${process.version}`);

  const client = new DynamoDBClient({
    region: process.env.TABLE_REGION || TABLE_REGION_DEFAULT,
  });
  const docClient = DynamoDBDocumentClient.from(client);

  const command = new ScanCommand({
    TableName: process.env.TABLE_NAME || TABLE_NAME_DEFAULT,
  });

  const output = await docClient.send(command);
  console.log(output);

  const result = {
    statusCode: 200,
    body: JSON.stringify({
      output,
    }),
  };

  console.log(result);
  return result;
};

// handler({}).then(() => {
//   console.log('done');
// });