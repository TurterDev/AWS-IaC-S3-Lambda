#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BmgAwsStack } from '../lib/bmg_aws-stack';
import {AwsSolutionsChecks, NagSuppressions} from 'cdk-nag'
import { CfnGuardValidator } from '@cdklabs/cdk-validator-cfnguard';

const app = new cdk.App({
  policyValidationBeta1: [
    new CfnGuardValidator({
      controlTowerRulesEnabled: false,
      rules: [
        "/Users/TurterDev/node_modules/@cdklabs/cdk-validator-cfnguard/rules/control-tower/cfn-guard",

      ],
      disabledRules: [
        "ct-s3-pr-4",
        "ct-s3-pr-9",
        "ct-s3-pr-10"
      ],
    })
  ]
});
const cdkStack = new BmgAwsStack(app, 'BmgAwsStack', {
  env: { account: '573690211264', region: 'ap-southeast-1' },
});

NagSuppressions.addStackSuppressions(cdkStack, [
  {
    id: "AwsSolutions-IAM5",
    reason: "Allow Lambda fucntion role to use * in policy that allow read access to bucket",
    appliesTo: [
      "Action::s3:GetBucket*",
      "Action::s3:GetObject*",
      "Action::s3:List*",
      "Resource::*",
      "Resource::<DemoS3bucketEE6FF967,Arn>/*",
    ]
  },
  {
    id: "AwsSolutions-IAM5",
    reason: "",
  }

]);

//Run CDK Nag check
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true}))