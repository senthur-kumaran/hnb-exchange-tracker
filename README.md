<!--
title: 'HNB Exchange Rate Tracker'
description: 'HNB USD and EURO rate tracker'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
-->

# Serverless Framework Node Scheduled Cron on AWS

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "hnb-exchange-tracker" to stage "dev" (ap-southeast-1)

✔ Service deployed to stack hnb-exchange-tracker-dev (140s)

functions:
  rateHandler: hnb-exchange-tracker-dev-rateHandler (4.7 MB)
  retryHandler: hnb-exchange-tracker-dev-retryHandler (4.7 MB)

```

There is no additional step required. Your defined schedules becomes active right away after deployment.

### Local development

The easiest way to develop and test your function is to use the `dev` command:

```
serverless dev
```

This will start a local emulator of AWS Lambda and tunnel your requests to and from AWS Lambda, allowing you to interact with your function as if it were running in the cloud.

Now you can invoke the function as before, but this time the function will be executed locally. Now you can develop your function locally, invoke it, and see the results immediately without having to re-deploy.

When you are done developing, don't forget to run `serverless deploy` to deploy the function to the cloud.

### Add secret keys
AWS Systems Manager -> Parameter Store
```
aws ssm put-parameter --name /exchange-rate/BOT_TOKEN --value "xxxxxx" --type "String"
aws ssm put-parameter --name /exchange-rate/CHAT_ID --value "xxxxxx" --type "String"
```