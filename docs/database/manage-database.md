import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Managing Databases

This document provides instructions on managing databases using the SDK or CLI. It covers various operations such as fetching and updating databases, as well as creating, fetching, and deleting tables (or collections).

<hr class="solid" />

## Fetching Databases

### Getting a Database by UUID

To retrieve databases in Rig, you can utilize the `Get` endpoint by including the unique `UUID` of the database in your request. Alternatively, you can utilize the `Lookup` endpoint which requires a database name. In the CLI, both of these endpoints are gathered under the same `get` command, where you can then either use the ID or the name as an identifier.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Get Database
databaseID := "" // insert your database ID here
resp, err := client.Database().GetDatabase(ctx, connect.NewRequest(&database.GetDatabaseRequest{
    DatabaseId: databaseID,
}))
if err != nil {
    log.Fatal(err)
}
log.Printf("successfully fetched database %v\n", resp.Msg.GetDatabase())

// Lookup Database
databaseName := "stocks"
resp, err := client.Database().LookupDatabase(ctx, connect.NewRequest(&database.LookupDatabaseRequest{
    Name: databaseName
}))
if err != nil {
    log.Fatal(err)
}
log.Printf("successfully fetched database %v\n", resp.Msg.GetDatabase().GetName())
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Get Database
const databaseID = ""; // insert your database ID here
const resp = await client.databasesClient.getDatabase({
  databaseId: databaseID,
});
console.log("successfully fetched database", resp.database.name);

// Lookup Database
const databaseName = "stocks";
const resp = await client.databasesClient.lookupDatabase({
  name: databaseName,
});
console.log("successfully fetched database", resp.database.name);
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database get [id | db-name] --json
```

Example

```sh
rig database get foods --json
```

</TabItem>
</Tabs>

### Listing Databases

To list databases in Rig, you can utilize the `List` endpoint. Pagination can be implemented using the `Offset` and `Limit` fields. The `Offset` field determines the starting point of the list, while the `Limit` field specifies the maximum number of databases to retrieve in each request.
<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// List databases.
resp, err := client.Database().ListDatabases(ctx, connect.NewRequest(&database.ListDatabasesRequest{
    Pagination: &model.Pagination{
        Offset: 0,
        Limit:  10,
    },
}))
if err != nil {
    log.Fatal(err)
}
log.Printf("successfully fetched %d databases\n", len(resp.Msg.GetDatabases()))
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// List databases.
const resp = await client.databasesClient.listDatabases({
  pagination: {
    offset: 0,
    limit: 10,
  },
});
console.log(`successfully fetched ${resp.databases.length} databases`);
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig database list --offset --limit --json
```

Example:

```sh
rig database list -o 10 -l 10 --json
```

</TabItem>
</Tabs>

The above query will fetch `10` databases in your project. The total amount of databases is returned as well.

## Managing Tables

A database consists of a collection of tables (Analogue to collections in MongoDB). These tables can be created and managed using either the SDK or CLI.

### Creating a Table

To create a table in your backend, you can utilize the `CreateTable` endpoint. In the example provided below, we demonstrate the creation of a table named "fruits" in our database:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Create a table
databaseID := "" // insert your database ID here
if _, err := client.Database().CreateTable(ctx, connect.NewRequest(&database.CreateTableRequest{
    DatabaseId: databaseID,
    TableName:  "fruits",
})); err != nil {
    log.Fatal(err)
}
log.Println("successfully created table")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Create a table
const databaseID = ""; // insert your database ID here
await client.databasesClient.createTable({
  databaseId: databaseID,
  tableName: "fruits",
});
console.log("successfully created table");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database create-table [id | db-name] --name
```

Example

```sh
rig database create-table foods -n fruits
```

</TabItem>
</Tabs>

### Listing Tables

To list the tables in your backend, you can make use of the `ListTables` endpoint:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// List tables
databaseID := "" // insert your database ID here
resp, err := client.Database().ListTables(ctx, connect.NewRequest(&database.ListTablesRequest{
    DatabaseId: databaseID,
    Pagination: &model.Pagination{
        Offset: 0,
        Limit:  10,
    },
}))
if err != nil {
    log.Fatal(err)
}
log.Printf("successfully fetched %d tables\n", len(resp.Msg.GetTables()))
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// List tables
const databaseID = ""; // insert your database ID here
const resp = await client.databasesClient.listTables({
  databaseId: databaseID,
  pagination: {
    offset: 0,
    limit: 10,
  },
});
console.log(`successfully fetched ${resp.tables.length} tables`);
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig database list-tables [id | db-name] --offset --limit --json
```

Example:

```sh
rig database list-tables foods -o 10 -l 10
```

</TabItem>
</Tabs>

### Deleting a Table

To delete a table in your backend, you can utilize the `DeleteTable` endpoint. Below, we are deleting our "fruits" table:
<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Delete a table
databaseID := "" // insert your database ID here
if _, err := client.Database().DeleteTable(ctx, connect.NewRequest(&database.DeleteTableRequest{
    DatabaseId: databaseID,
    TableName:  "fruits",
})); err != nil {
    log.Fatal(err)
}
log.Println("successfully deleted table")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Delete a table
const databaseID = ""; // insert your database ID here
await client.databasesClient.deleteTable({
  databaseId: databaseID,
  tableName: "fruits",
});
console.log("successfully deleted table");
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig database delete-table [id | db-name] --name
```

```sh
rig database delete-table foods -n fruits
```

</TabItem>
</Tabs>
