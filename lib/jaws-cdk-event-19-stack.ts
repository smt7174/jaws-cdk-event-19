import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import path from 'path';

import { S3_BUCKET_NAME, S3_KEY_NAME, DEPLOY_REGION } from '../parameters';

export class JawsCdkEvent19Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    const node23RuntimeLayer = new lambda.LayerVersion(this, 'Node23SampleLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../runtime-node23')),
      layerVersionName: 'runtime-node23-jawsug-cdk-event-19',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });
    
    // const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModulesLayer', {
    //   code: lambda.Code.fromAsset(path.join(__dirname, '../node-modules-layer')),
    //   layerVersionName: 'node-modules',
    //   removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    //   compatibleRuntimes: [
    //     lambda.Runtime.PROVIDED_AL2023,
    //     lambda.Runtime.NODEJS_22_X
    //   ],
    // });
    
    // const nodeModulesLayerManual = lambda.LayerVersion.fromLayerVersionArn(this, 'NodeModulesLayerManual', "arn:aws:lambda:us-east-1:659547760577:layer:node-modules-manual:1");
    
    const sampleFunction = new lambda.Function(this, "Node23SampleFunction", {
      functionName: 'Node23SampleFunction',
      runtime: lambda.Runtime.PROVIDED_AL2023, // Provide any supported Node.js runtime
      layers: [node23RuntimeLayer],
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      timeout: cdk.Duration.seconds(30),
      environment: {
        S3_KEY_NAME,
        S3_BUCKET_NAME,
        DEPLOY_REGION,
      }
    });
    
    const sampleFunctionUrl = sampleFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
    
    // const sampleFunctionJs = new lambda.Function(this, "Node23SampleFunctionJs", {
    //   functionName: 'Node23SampleFunctionJs',
    //   runtime: lambda.Runtime.PROVIDED_AL2023, // Provide any supported Node.js runtime
    //   layers: [node23RuntimeLayer, nodeModulesLayer],
    //   handler: "index.handler",
    //   code: lambda.Code.fromAsset(path.join(__dirname, '../lambda_js')),
    //   timeout: cdk.Duration.seconds(30),
    //   environment: {
    //     TABLE_NAME: TOD_DYNAMODB_TABLE_NAME,
    //     TABLE_REGION: TOD_DYNAMODB_TABLE_REGION,
    //   }
    // });
    
    // sampleFunctionJs.addFunctionUrl({
    //   authType: lambda.FunctionUrlAuthType.NONE,
    // });

    const sampleBucket = new s3.Bucket(this, 'SampleBucket', {
      bucketName: S3_BUCKET_NAME,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    sampleBucket.grantRead(sampleFunction);
    
    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "sampleFunctionUrlOutput", {
      value: sampleFunctionUrl.url,
    })
    
    cdk.Tags.of(this).add("GIT_REPO_NAME", "jaws-cdk-event-19");
  }
}
