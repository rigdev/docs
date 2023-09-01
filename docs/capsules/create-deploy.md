---
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ThemedImage from '@theme/ThemedImage';

# Deploy your application as a Capsule using the CLI

## Overview

In this document, you’ll learn how to build and deploy you application to Rig using the CLI.

<hr class="solid" />

## Prerequisites

### A dockerized application

It is assumed that you have a Dockerized application to deploy. If not, you can use the `nginx` docker image instead.

<hr class="solid" />

## Create a Capsule

Rig uses the concept of capsules which is a collection of ressources we create to manage your application on Docker or Kubernetes. Creating a Capsule using the CLI will take you through a series of steps to collect all the information we need create your Capsule. This also includes potentially creaing your first Build and performing the first Rollout.

To create the Capsule, from your terminal, run

```bash
rig capsule create
```

Your Capsule should now be ready and if you created it with an image and a replica count greater than one, you should be able to view its logs by running (if not, just continue)

```bash
rig capsule logs <capsule-name>
```

## Create a Build

Builds contain information about how to deploy your application - eg. build env, args, and your Docker image. Let's assume that you have not created or rolled out any Builds yet, but wish to do so. Go to your application and create a new Docker tag:

```bash
docker build -t mynewtag .
```

You can now create a new Build with that Docker image by running

```bash
rig capsule create-build <capsule-name> --image mynewtag
```

This will upload the image to the Rig private container registry and create a Build. If successful, the method ends by printing the ID of your build, which is an incremental number starting from 1.

To view a list of your builds, run

```bash
rig capsule list-builds <capsule-name>
```

## Rollout a Build

We are now ready to run the build we just created. Rollout your build using the following command

```bash
rig capsule deploy <capsule-name> --build-id <build-id>
```

Exchange build-id with the ID of your build. The last thing we need to do is to scale our capsule to a number of replicas. To scale our capusle to 2 replicas, we run

```bash
rig capsule scale <capusle-name> --replicas 2
```
