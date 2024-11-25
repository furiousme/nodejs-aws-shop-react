import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Bucket, BlockPublicAccess } from "aws-cdk-lib/aws-s3";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";

export class ShopDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "ShopBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });

    const oai = new OriginAccessIdentity(this, "ShopOriginAccessIdentity", {
      comment: "OAI for shop distribution",
    });

    const distribution = new CloudFrontWebDistribution(
      this,
      "ShopBucketDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: oai,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
              },
            ],
          },
        ],
        defaultRootObject: "index.html",
      }
    );

    bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [bucket.arnForObjects("*")],
        principals: [new ServicePrincipal("cloudfront.amazonaws.com")],
        conditions: {
          StringEquals: {
            "AWS: SourceArn": `arn:aws:cloudfront::${this.account}:distribution/${distribution.distributionId}`,
          },
        },
      })
    );

    bucket.grantRead(oai);

    new BucketDeployment(this, "ShopBucketDeployment", {
      sources: [Source.asset("../dist")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new cdk.CfnOutput(this, "DistributionUrl", {
      value: distribution.distributionDomainName,
    });
  }
}
