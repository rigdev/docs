---
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ThemedImage from '@theme/ThemedImage';

# Deploy your application as a Capsule

In this document, you’ll learn how to build and deploy your application to Rig using the CLI.

<hr class="solid" />

## Prerequisites

### A dockerized application

It is assumed that you have a Dockerized application to deploy. If not, you can use the `nginx` docker image instead.

<hr class="solid" />

## Create a Capsule

Rig uses the concept of capsules which is a collection of resources we create to manage your application on Docker or Kubernetes. Creating a Capsule using the CLI will take you through a series of steps to collect all the information needed to create your Capsule. This also includes potentially creating your first Build and performing your first Rollout.

To create the Capsule, from your terminal, run

```bash
rig capsule create -i
```

Your Capsule should now be ready and if you created it with an image and deployed it, you should be able to view its logs by running:

```bash
rig capsule -c <capsule-name> instance logs <instance-id>
```

## Create a Build

Builds contain information about how to deploy your application - eg. build env, args, and your Docker image. Let's assume that you have not created or rolled out any Builds yet, but wish to do so. Go to your application and create a new Docker tag:

```bash
docker build -t mynewimage .
```

You can now create a new Build with that Docker image by running

```bash
rig capsule -c <capsule-name> build create --image mynewimage
```

This will upload the image to the Rig and create a Build.

To view a list of your builds, run

```bash
rig capsule -c <capsule-name> build get
```

## Deploy an iamge

You are now ready to run the build we just created. Rollout your build using the following command

```bash
rig capsule -c <capsule-name> deploy --build-id <build-id>
```

We can also shortcut the creation of build and deployment by simply supplying the deploy command with the same image. This wil automatically create a corresponding build and deploy it. This can be done by running:

```bash
rig capsule -c <capsule-name> deploy -i mynewimage
```

Lastly, you can scale your capsule to more instances. To scale the number of instances to 2 run

```bash
rig capsule -c <capusle-name> resource scale --replicas 2
```
