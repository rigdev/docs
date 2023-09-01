import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Connecting to MongoDB using the SDK

## Overview

This document provides instructions on how to connect your application to MongoDB using the SDK.

<hr class="solid" />

## Prerequisites

### Create a MongoDB Database

Before continuing with the instructions, it is important to ensure that you have already created a MongoDB database. If you haven't done so yet, you can create a database using either the SDK or CLI. For more detailed information on how to create databases, please refer to the [creating databases section](/database/create-database).

### Create Database Credential

To establish a connection to your database using the SDK, you will need to create a database credential. If you haven't done so already, please refer to the [creating credentials section](/database/create-credential) for instructions on how to create the necessary credentials.

<hr class="solid" />

## Connecting to MongoDB

To connect to your MongoDB database, utilize the `GetEndpoint` endpoint as below:
<Tabs>
<TabItem value="go" label="Golang SDK">

```go
databaseID := "" // insert your database ID here
res, err := client.Database().GetEndpoint(ctx, &database.Credential{
    DatabaseId: databaseID,
    ClientId: "YOUR-DB-CREDENTIAL-CLIENT-ID",
    ClientSecret: "YOUR-DB-CREDENTIAL-SECRET"
})
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Mongo Endpoint: %s \n", res.Msg.GetEndpoint())
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const databaseID = ""; // insert your database ID here
const res = await client.databasesClient.getEndpoint({
  databaseId: databaseID,
  clientId: "YOUR-DB-CREDENTIAL-CLIENT-ID",
  clientSecret: "YOUR-DB-CREDENTIAL-SECRET",
});
console.log("Mongo Endpoint:", res.endpoint);
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database connect [id | db-name] --client-id --clinet-secret
```

```sh
rig database connect foods -i YOUR-DB-CREDENTIAL-CLIENT-ID -s YOUR-DB-CREDENTIAL-SECRET
```

The endpoint will then be printed in the terminal

</TabItem>
</Tabs>
