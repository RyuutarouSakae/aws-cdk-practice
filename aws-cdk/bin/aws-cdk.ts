#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { HelloCdkStack } from "../lib/hello-cdk-stack";
import { GithubActionsAwsAuthCdkStack } from "../lib/stacks/github-actions-aws-auth-cdk-stack";

const app = new cdk.App();

new HelloCdkStack(app, "HelloCdkStack", {
  env: { account: "714059461831", region: "ap-northeast-1" },
});

new GithubActionsAwsAuthCdkStack(app, "GithubActionsAwsAuthCdkStack", {
  env: { account: "714059461831", region: "ap-northeast-1" },
  repositoryConfig: [{ owner: "RyuutarouSakae", repo: "aws-cdk-practice" }],
});
