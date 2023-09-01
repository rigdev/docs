---
pagination_prev: null
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ThemedImage from '@theme/ThemedImage';

# Deploy your application to a Capsule using Github Actions

## Overview

In this document you'll learn how to build and deploy your application automatically using [Github Actions](https://github.com/features/actions).

## Prerequisites

It is assumed that you have a Rig Capsule up and running, see [Deploy Your Application](/capsules/create-deploy) if not. You should also have a Github repository which you would like to build and deploy to your capsule.

## Stuff

Rig exposes two different actions, `build` and `deploy`. The `build` action assumes you have a Docker image you want to deploy and makes a Rig build off of it. The `deploy` action can then deploy the previously (or any other) generated build to a capsule.
As you need a Docker image to build and deploy, it is common to prefix these two actions with [Docker Github actions](https://docs.docker.com/build/ci/github-actions/) to build and publish an image.

The following Github workflow example showcases how you can

1. Build a Docker image from a new commit
2. Make a Rig build from that Docker image
3. Deploy that Rig build to your Rig capsule

You can choose your own `buildID` in the `build` action, or if not provided the `buildID` will be the first 10 characters of the Git commit SHA.

```yaml
on: [push]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: YOUR_DOCKER_HUB_USERNAME
          password: YOUR_DOCKER_HUB_PASSWORD
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: YOUR_DOCKER_IMAGE
      - name: Build Rig
        uses: rigdev/actions/build@v1
        id: build_rig
        with:
          clientID: YOUR_SERVICE_ACCOUNT_ID_FOR_YOUR_CAPSULE
          clientSecret: YOUR_SERVICE_ACCOUNT_SECRET_FOR_YOUR_CAPSULE
          url: URL_TO_YOUR_RIG_CLUSTER
          image: YOUR_DOCKER_IMAGE
          capsuleID: YOUR_CAPSULE_ID
      - name: Deploy to capsule
        uses: rigdev/actions/deploy@v1
        with:
          clientID: YOUR_SERVICE_ACCOUNT_ID_FOR_YOUR_CAPSULE
          clientSecret: YOUR_SERVICE_ACCOUNT_SECRET_FOR_YOUR_CAPSULE
          url: URL_TO_YOUR_RIG_CLUSTER
          capsuleID: YOUR_CAPSULE_ID
          buildID: ${{ steps.build_rig.outputs.buildID }}
```
