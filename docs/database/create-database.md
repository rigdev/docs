import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating Databases

This document provides instructions on how to create databases using the SDK or CLI in Rig.

<hr class="solid" />

## Creating Databases
To create a database on your backend, you can utilize the `Create` endpoint. Set the `Name` field to specify the desired name for the database that you want to create. This name must be unique to your project.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
if _, err := client.Database().CreateDatabase(ctx, connect.NewRequest(&database.CreateDatabaseRequest{
  Initializers: []*database.Update{
    {Field: &database.Update_Name{Name: "foods"}},
  },
  Type: database.Type_TYPE_MONGO,
})); err != nil {
  log.Fatal(err)
}
log.Println("successfully created MongoDB database")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
await client.databasesClient.createDatabase({
  initializers: [{ field: { case: "name", value: "foods" } }],
  type: Type.MONGO,
});
console.log("successfully created MongoDB database");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig database create --name --type
```

Example:

```sh
rig database create --name foods --type mongo
```

The fields of the database will be prompted for
</TabItem>
</Tabs>
