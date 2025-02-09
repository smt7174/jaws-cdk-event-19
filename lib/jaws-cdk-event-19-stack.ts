import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import path from 'path';

export class JawsCdkEvent19Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    const node23RuntimeLayer = new lambda.LayerVersion(this, 'Node23SampleLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../runtime-node23')),
      layerVersionName: 'runtime-node23-jawsug-cdk-event-19',
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
    });
    
    const sampleFunction = new lambda.Function(this, "Node23SampleFunction", {
      functionName: 'Node23SampleFunction',
      runtime: lambda.Runtime.PROVIDED_AL2023, // Provide any supported Node.js runtime
      layers: [node23RuntimeLayer],
      handler: "index.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      timeout: cdk.Duration.seconds(30),
    });
    
    const sampleFunctionUrl = sampleFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "sampleFunctionUrlOutput", {
      value: sampleFunctionUrl.url,
    })
    
    cdk.Tags.of(this).add("GIT_REPO_NAME", "jaws-cdk-event-19");
  }
}
