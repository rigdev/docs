import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating Database Credentials

Database credentials can be used to connect your application to your database. This document provides instructions on how to create database credentials using the SDK or CLI.

<hr class="solid" />

## Creating Database Databases

To create a database credential in Rig, you can utilize the `CreateCredential` endpoint:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
databaseID := "" // insert your database ID here
if _, err := client.Database().CreateCredential(ctx, connect.NewRequest(&database.CreateCredentialRequest{
    Name:       "your-credential-name",
    DatabaseId: databaseID,
})); err != nil {
    log.Fatal(err)
}
log.Println("successfully created database credential")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const databaseID = ""; // insert your database ID here
await client.databasesClient.createCredential({
  name: "your-credential-name",
  databaseId: databaseID,
});
console.log("successfully created database credential");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database create-credential [id | db-name] --name
```

```sh
rig database create-credential foods -n food-credentials
```

The name of the credentials will then be prompted if not provided by the flag
</TabItem>
</Tabs>
