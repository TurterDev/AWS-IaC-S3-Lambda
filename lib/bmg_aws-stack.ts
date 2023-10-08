import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from "aws-cdk-lib/aws-iam"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as logs from "aws-cdk-lib/aws-logs"
import path = require('path');

export class BmgAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const s3bucket = new s3.Bucket(this, 'Stack1', {
      bucketName: `turter-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      enforceSSL: true,
    });

    const lambdaRole = new iam.Role(this, "LambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      path: "/",
    });

    const lambdaRolePolicy = new iam.Policy(this, "Lambda-Role-Policy",{
      policyName: "Lambda-Role-Policy",
      statements: [
        new iam.PolicyStatement({
          sid: "S3ReadAccess",
          effect: iam.Effect.ALLOW,
          actions: [
            "s3:Get*",
            "s3:List*",
            "s3:Descibe*",
          ],
          resources: [s3bucket.bucketArn]
        })
      ]
    });
    lambdaRole.attachInlinePolicy(lambdaRolePolicy)

    const lambdaFunction = new lambda.Function(this, "Lambda-Function", {
        functionName: "Lambda-S3Read",
        code: lambda.Code.fromAsset(path.join(__dirname,"/lambda")),
        handler: 's3listbucket.handler',
        runtime: lambda.Runtime.PYTHON_3_11,
        memorySize: 128,
        role: lambdaRole,
        timeout: cdk.Duration.seconds(15),
        environment: {
          BUCKET_NAME: s3bucket.bucketName
        },
        logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const apiGatewayLambdaRestApi = new apigateway.LambdaRestApi(this, "APIGateway-LambdaRestAPI", {
      restApiName: "APIGateway-LambdaRestAPI",
      handler: lambdaFunction,
    })

  }
}
