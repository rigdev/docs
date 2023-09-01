import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating Database Credentials using the SDK or CLI

## Overview

This document provides instructions on how to delete database credentials using the SDK or CLI.

<hr class="solid" />

## Deleting Database Databases

To delete a database credential in Rig, you can utilize the `DeleteCredential` endpoint:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
databaseID := "" // insert your database ID here
credentialID := ""
if _, err := client.Database().DeleteCredential(ctx, connect.NewRequest(&database.DeleteCredentialRequest{
    CredentialId: credentialID,
    DatabaseId:   databaseID,
})); err != nil {
    log.Fatal(err)
}
log.Println("successfully deleted database credential")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const databaseID = ""; // insert your database ID here
const credentialID = "";
await client.databasesClient.deleteCredential({
  credentialId: credentialID,
  databaseId: databaseID,
});
console.log("successfully deleted database credential");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database create-credential [id | db-name] --name
```

Example:

```sh
rig database create-credential foods -n food-credentials
```

</TabItem>
</Tabs>
