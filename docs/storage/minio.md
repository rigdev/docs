
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Setup Minio Storage in Rig
This document provides instructions on how to setup Minio Storage in Rig using the dashboard. The flow for setting up Minio Storage using the CLI is analogous to this flow, just in the CLI.

<hr class="solid" />

## Prerequisites
Before you can setup Minio storage in Rig, you need to have access to a Minio server. If you do not have access to a minio server, you can create one using the [minio docker image](https://hub.docker.com/r/minio/minio). From the Minio server, you need an access key, a secret key, and an endpoint. Minio is also compatible with S3, so it is possible to use AWS S3 as a Minio server. This is however not recommended, instead, you should use the AWS S3 provider described in the [AWS S3 documentation](/docs/storage/s3.md).

## Adding Minio Storage to Rig
To add Minio Storage to Rig, you simply need to input the access key, the secret key, and the endpoint for the Minio server. This can be done either using the dashboard or the CLI. The general flow for creating a provider is described in the [providers documentation](/docs/storage/providers.md).

Using the dashboard, you add the Minio Provider to Rig by navigating to the `Storage` page and clicking Add Provider. This will open a modal, where you give your provider a unique name, select Minio Storage as the provider type, and enter the endpoint, access key, and secret key. 

![Add provider](/img/storage/minio_add_provider.png "Add provider")

If you link existing buckets, Rig will automatically create a Rig-bucket for each bucket in your Minio-server for the input credentials. Otherwise, the provider will appear empty until you create a bucket. 

## Creating Buckets and Uploading files
Once you have created a provider, you can create buckets and upload files to them. The general flow for this is the same as for all providers and is described in the [buckets documentation](/docs/storage/buckets.md) and the [upload files documentation](/docs/storage/uploading-objects.md).

In the dashboard, you can create buckets by navigating to the `Storage` page and clicking the "New Bucket" button. This will open a modal, where you can give your bucket a name, and a provider bucket name, select the provider you want to create the bucket in, and enter a region for the bucket. This region must match one of the regions supported by the given provider. Naturally, this is not relevant unless you choose to use a Minio server that is hosted by a cloud provider with multiple regions as fx. AWS.

![Create bucket](/img/storage/minio_create_bucket.png "Create bucket")

After a bucket has been created, it is possible to upload files to the bucket. This flow is described in the [upload files documentation](/docs/storage/uploading-objects.md). In the dashboard, you can upload files by clicking the upload files button on the bucket page.
