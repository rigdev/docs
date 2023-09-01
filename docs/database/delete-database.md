import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Deleting Databases using the SDK or CLI

## Overview

This document provides instructions on how to delete databases using the SDK or CLI.

<hr class="solid" />

## Deleting Databases

To delete a single database from Rig, you can utilize the `DeleteDatabase` endpoint:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
databaseID := "" // insert your database ID here
if _, err := client.Database().DeleteDatabase(ctx, connect.NewRequest(&database.DeleteDatabaseRequest{
    DatabaseId: databaseID,
})); err != nil {
    log.Fatal(err)
}
log.Println("successfully deleted database")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
const databaseID = ""; // insert your database ID here
await client.databasesClient.deleteDatabase({
  databaseId: databaseID,
});
console.log("successfully deleted database");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database delete [id | db-name]
```

Example:

```sh
rig database delete foods
```

</TabItem>
</Tabs>
