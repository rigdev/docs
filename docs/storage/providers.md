import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating and Managing Storage Providers using the SDK or CLI

## Overview

This page provides instructions on how to create and manage storage providers using the SDK or the CLI. Each storage provider is associated with a backend storage provider, such as S3 or GCS and a set of credentials that allow access to the backend. The credentials are encrypted and stored in the Rig database. The providers additionally contain a set of buckets that are associated with the provider.

<hr class="solid" />

## Creating Providers

To create storage providers, you can utilize the `CreateProvider` endpoint. When making the request it is necessary to provide a unique name for the provider, and a config object for a particular backend. What this config object contains is different for each backends:

- An S3 Config object contains a default region, and a set of credentials.
- A Minio config object contains a set of credentials, an endpoint to connect to.
- For GCS, the config should contain a service account key in JSON format.

The Create Provider endpoint also takes a boolean `LinkBuckets`parameter. When `true`, the provider will be linked to all existing buckets in the backend for that configuration. Below is an example of created a provider for GCS using the SDK and the CLI.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Create a provider for Google Cloud Storage
resp, err := client.Storage().CreateProvider(ctx, connect.NewRequest(&storage.CreateProviderRequest{
  Name: "my-provider",
  Config: &storage.Config_Gcs{
    Gcs: &storage.GcsConfig{
        Config: buf,                // The service account key in JSON format.
    },
  },
  LinkBuckets: true,
}))
if err != nil {
  log.Fatal(err)
}
fmt.Printf("successfully created provider")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Create a provider for Google Cloud Storage
const resp = await client.storage.createProvider({
  name: "my-provider",
  config: {
    config: {
      case: "gcs",
      value: {
        config: buffer, // The service account key in JSON format.
      },
    },
  },
  linkBuckets: true,
});
console.log("successfully created provider");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage create-provider --name --link-buckets --gcs --s3 --minio --credsfile --access-key --secret-key --region --endpoint
```

It is also possible to provide the configs as flags. Here the type of provider is specified using one of the three binary flags `--gcs`, `--s3`, or `--minio`. The flags `--credsfile`, `--access-key`, `--secret-key`, `--region`, and `--endpoint` are then used to provide the config object. The `--link-buckets` flag is used to specify whether the provider should be linked to all existing buckets in the backend.

Example:

```sh
rig storage create-provider -n my-gcs-provider -l --gcs -c ./service-account-key.json
```

If the fields for the provider are not specified, they will be prompted for interactively.
</TabItem>
</Tabs>

<hr class="solid" />

## Deleting Providers

To delete a provider, simply provide the ID of the provider to the `DeleteProvider` endpoint. This will delete the provider and all the associated credentials from the rig database. Using the CLI, you can also provide a provider name instead of an ID, as these are also unique. It is important to note, that this will not delete buckets or files in the backend, but simply remove the link to Rig.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Delete a provider for Google Cloud Storage
providerID := "" // NOTE: insert providerID here
resp, err := client.Storage().DeleteProvider(ctx, connect.NewRequest(&storage.DeleteProviderRequest{
  ProviderID: providerID
}))
if err != nil {
  log.Fatal(err)
}
fmt.Printf("successfully deleted provider")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Delete a provider for Google Cloud Storage
const providerID = ""; // NOTE: insert providerID here
const resp = await client.storagesClient.deleteProvider({
  providerID: providerID,
});
console.log("successfully deleted provider");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage delete-provider [id | name]
```

Example:

```sh
rig storage delete-provider my-gcs-provider
```

</TabItem>
</Tabs>

<hr class="solid" />

## Fetching Providers

### Getting a provider

Getting a single provider can be done using the `GetProvider`endpoint, that takes a provider ID as input, or using the `LookupProvider` endpoint that takes a provider name as input. In the CLI these are gathered under a single command.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Get a provider
providerID := "" // NOTE: insert providerID here
resp, err := client.Storage().GetProvider(ctx, connect.NewRequest(&storage.GetProviderRequest{
  ProviderID: providerID
}))
if err != nil {
  log.Fatal(err)
}
fmt.Println("Succesfully retrieved provider" + resp.Msg.GetProvider().String())

// Lookup a provider
resp, err := client.Storage().LookupProvider(ctx, connect.NewRequest(&storage.LookupProviderRequest{
  Name: "my-provider"
}))
if err != nil {
  log.Fatal(err)
}
fmt.Println("Succesfully retrieved provider" + resp.Msg.GetProvider().String())
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Get a provider
providerID = ""; // NOTE: insert providerID here
const resp = await client.storagesClient.getProvider({
  providerID: providerID,
});
console.log("Succesfully retrieved provider", resp.provider);

// Lookup a provider
const resp = await client.storage.lookupProvider({
  name: "my-provider",
});
console.log("Succesfully retrieved provider", resp.provider);
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage get-provider [id | name] --json
```

Example:

```sh
rig storage get-provider my-gcs-provider --json
```

</TabItem>
</Tabs>

### Listing providers

Listing providers can be done using the `ListProviders` endpoint. Pagination can be implemented using the `Offset` and `Limit` fields. The `Offset` field determines the starting point of the list, while the `Limit` field specifies the maximum number of providers to retrieve in each request.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
resp, err := client.Storage().ListProviders(ctx, connect.NewRequest(&storage.ListProvidersRequest{
    Pagination: &model.Pagination{
        Offset: 10,
        Limit:  10,
    },
}))
if err != nil {
    log.Fatal(err)
}
fmt.Printf("successfully fetched %d storage providers. Total amount is: %d", len(resp.Msg.GetProviders()), resp.Msg.GetTotal())
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const resp = await client.storagesClient.listProviders({
  pagination: {
    offset: 10,
    limit: 10,
  },
});
console.log(
  `successfully fetched ${resp.providers.length} storage providers. Total amount is: ${resp.total}`,
);
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig storage list-providers --offset --limit --json
```

Example:

```sh
rig storage list-providers -o 10 -l 10
```

</TabItem>
</Tabs>
