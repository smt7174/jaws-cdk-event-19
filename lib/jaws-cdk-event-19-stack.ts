import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { TableV2, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import path from 'path';

import { TOD_DYNAMODB_TABLE_ARN, TOD_DYNAMODB_TABLE_NAME, TOD_DYNAMODB_TABLE_REGION } from '../parameters';

export class JawsCdkEvent19Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    const node23RuntimeLayer = new lambda.LayerVersion(this, 'Node23SampleLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../runtime-node23')),
      layerVersionName: 'runtime-node23-jawsug-cdk-event-19',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });
    
    const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModulesLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../nodejs')),
      layerVersionName: 'node-modules',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });
    
    const sampleFunction = new lambda.Function(this, "Node23SampleFunction", {
      functionName: 'Node23SampleFunction',
      runtime: lambda.Runtime.PROVIDED_AL2023, // Provide any supported Node.js runtime
      layers: [node23RuntimeLayer, nodeModulesLayer],
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: TOD_DYNAMODB_TABLE_NAME,
        TABLE_REGION: TOD_DYNAMODB_TABLE_REGION,
      }
    });
    
    const sampleFunctionUrl = sampleFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    const todDynamoDbTable = TableV2.fromTableArn(this, 'todDynamoDbTable', TOD_DYNAMODB_TABLE_ARN);
    todDynamoDbTable.grantReadData(sampleFunction);
    
    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "sampleFunctionUrlOutput", {
      value: sampleFunctionUrl.url,
    })
    
    cdk.Tags.of(this).add("GIT_REPO_NAME", "jaws-cdk-event-19");
  }
}
