import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating and Managing Buckets

Buckets in Rig are references to buckets in the connected backends. To this end, Rig-buckets have both a unique name for Rig, and a provider name used when interacting with the backends. They also contain the region in which the bucket is created.

<hr class="solid" />

## Creating Buckets
Creating buckets is done using the `CreateBucket` endpoint. The endpoint takes as input a name for the bucket, a provider name, and a region. The name is unique in Rig, and the provider name is the name of the bucket in the backend. The region is the region in which the bucket is created. A list of available regions can be found in the [AWS documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html) for S3, and the [Google Cloud documentation](https://cloud.google.com/storage/docs/locations) for GCS. In the case of a self-hosted Minio Server, the region does not make much sense and can be left blank. If a bucket with the given provider name already exists in the backend, the bucket will be linked to Rig. If not, it will be created.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Create a bucket in eu-central-1
providerID := "" // NOTE: insert providerID here
resp, err := client.Storage().CreateBucket(ctx, connect.NewRequest(&storage.CreateBucketRequest{
  Bucket: "my-bucket",
  ProviderBucket: "my-bucket",
  Region: "eu-central-1",
  ProviderId: providerID,
}))
if err != nil {
  log.Fatal(err)
}
log.Printf("successfully created bucket")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Create a bucket in eu-central-1
const providerID = ""; // NOTE: insert providerID here
const resp = await client.storagesClient.createBucket({
  bucket: "my-bucket",
  providerBucket: "my-bucket",
  region: "eu-central-1",
  ProviderId: providerID,
});
console.log("successfully created bucket \n");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage create-bucket [provider-name] --name --provider-bucket-name --region
```

Example:

```sh
rig storage create-bucket my-provider -n fruits -p rig_fruits -r eu-central-1
```

Fields of the bucket are prompted for.
</TabItem>
</Tabs>

<hr class="solid" />

## Deleting Buckets

As buckets in Rig are references to Buckets for the given providers, it is possible to either delete the buckets in the backend or simply unlink them to Rig. To delete a bucket, the endpoint `DeleteBucket` can be used and to unlink the bucket, the `UnlinkBucket`endpoint can be used. Both endpoints take the Rig bucket name as input.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Delete a bucket
resp, err := client.Storage().DeleteBucket(ctx, connect.NewRequest(&storage.DeleteBucketRequest{
  Bucket: "my-bucket",
}))
if err != nil {
  log.Fatal(err)
}
log.Printf("successfully deleted bucket \n")

// Unlink a bucket
resp, err := client.Storage().UnlinkBucket(ctx, connect.NewRequest(&storage.UnlinkBucketRequest{
  Bucket: "my-bucket",
}))
if err != nil {
  log.Fatal(err)
}
log.Printf("successfully unlinked bucket \n")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Delete a bucket
const resp = await client.storagesClient.deleteBucket({
  bucket: "my-bucket",
});
console.log("successfully deleted bucket");

// Unlink a bucket
const resp = await client.storagesClient.unlinkBucket({
  Bucket: "my-bucket",
});
console.log("successfully unlinked bucket");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage delete-bucket [bucket]

rig storage unlink-bucket [bucket]
```

Example:

```sh
rig storage delete-bucket my-bucket

rig storage unlink-bucket my-bucket
```

</TabItem>
</Tabs>

<hr class="solid" />

## Fetching Buckets

### Getting a Bucket
To fetch a bucket, the `GetBucket` endpoint can be used. The endpoint takes the Rig bucket name as input and returns the bucket object.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Get a bucket
resp, err := client.Storage().GetBucket(ctx, connect.NewRequest(&storage.GetBucketRequest{
  Bucket: "my-bucket",
}))
if err != nil {
  log.Fatal(err)
}
log.Println("Succesfully retrieved bucket %s", resp.Msg.GetBucket().GetName())
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Get a bucket
const resp = await client.storagesClient.getBucket({
  bucket: "my-bucket",
});
console.log("Succesfully retrieved bucket", resp.bucket);
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage get-bucket [name] --json
```

Example:

```sh
rig storage get-bucket my-bucket --json
```

</TabItem>
</Tabs>

### Listing Buckets

Listing buckets using the SDK can be done using the `ListBuckets` endpoint. This will return all Rig-buckets across the providers. The endpoint takes no input and returns a list of buckets. In the CLI, this functionality is combined with listing of objects and is done using the `list` command. When no path is given, the command will list all buckets, and when a path is given, it will list all objects in the given path. Refer to the [objects documentation](./manage-objects.md) for more information on listing objects.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
resp, err := client.Storage().ListBuckets(ctx, connect.NewRequest(&storage.ListBucketsRequest{}))
if err != nil {
    log.Fatal(err)
}
log.Printf("successfully fetched %d buckets \n", len(resp.Msg.GetBuckets()))
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const resp = await client.storagesClient.listBuckets({});
console.log(`successfully fetched ${resp.buckets.length} buckets`);
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig storage list [path] --json
```

Example:

```sh
rig storage list --json
```

</TabItem>
</Tabs>
