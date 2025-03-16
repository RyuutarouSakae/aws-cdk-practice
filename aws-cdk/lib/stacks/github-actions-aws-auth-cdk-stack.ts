import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_iam as iam } from "aws-cdk-lib";

type Props = cdk.StackProps & {
  readonly repositoryConfig: { owner: string; repo: string; filter?: string }[];
};

export class GithubActionsAwsAuthCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);

    const githubDomain = "https://token.actions.githubusercontent.com";
    const githubClientId = "sts.amazonaws.com";

    const githubProvider = new iam.OpenIdConnectProvider(
      this,
      "GithubActionsProvider",
      { url: githubDomain, clientIds: [githubClientId] }
    );

    const iamRepoDeployAccess = props.repositoryConfig.map(
      ({ owner, repo, filter }) => `repo:${owner}/${repo}:${filter ?? "*"}`
    );

    const conditions: iam.Conditions = {
      StringLike: {
        "token.actions.githubusercontent.com:sub": iamRepoDeployAccess,
      },
      StringEquals: {
        "token.actions.githubusercontent.com:aud": githubClientId,
      },
    };

    const role = new iam.Role(this, "gitHubActionsRole", {
      roleName: "githubActionsRole",
      description: "This role is used via GitHub Actions with AWS CDK",
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(
        githubProvider.openIdConnectProviderArn,
        conditions
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AdministratorAccess"),
      ],
    });

    new cdk.CfnOutput(this, "GithubActionOidcIamRoleArn", {
      value: role.roleArn,
      description: `Arn for AWS IAM role with Github oidc auth for ${iamRepoDeployAccess}`,
      exportName: "GithubActionOidcIamRoleArn",
    });

    cdk.Tags.of(this).add("component", "CdkGithubActionsOidcIamRole");
  }
}
