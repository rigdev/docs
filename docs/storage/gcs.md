
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Setup Google Cloud Storage in Rig
This document provides instructions on how to setup Google Cloud Storage (GCS) in Rig using either the dashboard. The flow for setting up GCS using the CLI is analogous to this flow, just in the CLI.

<hr class="solid" />

## Prerequisites
Before you can setup GCS in Rig, you need to have a Google Cloud account. If you do not have one, you can create one [here](https://cloud.google.com).
You also need to create a service account with Identity and Access Management (IAM) storage permissions for Rig to be able to access your GCS. The service account is then used to create a set of credentials, which is used to authenticate Rig with GCS.

## Adding Google Cloud Storage to Rig
To add GCS to Rig, you simply need to parse in the key for the service account to Rig. The general flow for creating a provider is described in the [providers documentation](/docs/storage/providers.md). 

Using the dashboard, you can add the credentials to Rig by navigating to the `Storage` page and clicking Add Provider. This will open a modal, where you give your provider a unique name, select Google Cloud Storage as the provider type, and upload a credentials file for your service account. 

![Add provider](/img/storage/gcs_add_provider.png "Add provider")

If you link existing buckets, Rig will automatically create a Rig-bucket for each bucket in your GCS. Otherwise, the provider will appear empty until you create a bucket. 

## Creating Buckets and Uploading files
Once you have created a provider, you can create buckets and upload files to them. The general flow for this is the same as for all providers and is described in the [buckets documentation](/docs/storage/buckets.md) and the [upload files documentation](/docs/storage/uploading-objects.md).

In the dashboard, you can create buckets by navigating to the `Storage` page and clicking the "New Bucket" button. This will open a modal, where you can give your bucket a name, a provider bucket name, select the provider you want to create the bucket in, and enter a region for the bucket. This region must match one of the regions supported by the given provider. For GCS this is described [here](https://cloud.google.com/storage/docs/locations).

![Create Bucket](/img/storage/gcs_create_bucket.png "Create Bucket")

After a bucket has been created, it is possible to upload files to the bucket. This flow is described in the [upload files documentation](/docs/storage/uploading-objects.md). In the dashboard, you can upload files by clicking the upload files button on the bucket page.
