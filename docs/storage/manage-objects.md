import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Managing Objects
Rig provides a unified API to manage objects across different backends. Except for uploading and downloading objects, this page describes how Rig works with objects and their metadata. When working with objects in the CLI, the path of the object is a Rig storage path, which consists of the name of the bucket, and the path of the object in the bucket, separated by a `/`. For example, `rig://my-bucket/path/to/object.txt`.

<hr class="solid" />

## Fetching objects
Fetching objects corresponds to fetching metadata about these objects. The information differs a bit depending on the backend on which the object is stored, but generally, this metadata has fields like `path`, `size`, `etag`, `last modified`, and `content type`.

### Fetching a single object
Fetching metadata of a single object can be done using the `GetObject` endpoint. This endpoint takes the name of the bucket in which the object is stored, and then the path of the object. The path is the full path of the object, including the name of the object.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Get an Object
resp, err := client.Storage().GetObject(ctx, connect.NewRequest(&storage.GetObjectRequest{
  Bucket: "my-bucket",
  Path: "path/to/object.txt",
}))
if err != nil {
  log.Fatal(err)
}
fmt.Println("Succesfully retrieved object" + resp.Msg.GetObject().String())
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage get-object [path] --json
```

Here the path is a rig storage path, which is the full path of the object, including the name of the bucket.

Example:

```sh
rig storage get-object rig://my-bucket/path/to/object.txt --json
```

</TabItem>
</Tabs>

### Listing objects

Listing objects can be done using the `ListObjects` endpoint. This endpoint takes a bucketname, a token, a prefix, a start path, an endpath, a recursive flag, and a limit. Given a prefix, the endpoint only returns objects that are lexicographically greater than the prefix. The start and end paths can be used to specify a range of objects to return. The recursive flag is used to specify whether to return objects in subdirectories or not. The limit is used to specify the maximum number of objects to return. The token implements pagination, in case a limit is specified. The CLI does not support all these options but only takes a prefix and the recursive flag.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// List objects in "my-bucket" prefixed with "path/to", lexico-graphically greater than "path/to/object1",
// and less than "path/to/object100", recursively, and return a maximum of 10 objects.
resp, err := client.Storage().ListObjects(ctx, connect.NewRequest(&storage.ListObjectsRequest{
    Bucket: "my-bucket",
    Prefix: "path/to",
    StartPath: "path/to/object1",
    EndPath: "path/to/object100",
    Recursive: true,
    Limit: 10,
}))
if err != nil {
    log.Fatal(err)
}
fmt.Printf("successfully fetched %d objects. Next token: %s", len(resp.Msg.GetObjects()), resp.Msg.GetToken())
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig storage list [path] --recursive --json
```

Example:

```sh
rig storage list rig://my-bucket/path/to -r true --json
```

</TabItem>
</Tabs>

<hr class="solid" />

## Deleting objects

Deleting objects can be done using the `DeleteObject` endpoint. This endpoint takes the name of the bucket in which the object is stored, and then the path of the object. The path is the full path of the object, including the name of the object.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Delete an object
resp, err := client.Storage().DeleteObject(ctx, connect.NewRequest(&storage.DeleteObjectRequest{
  Bucket: "my-bucket",
  Path: "path/to/object.txt"
}))
if err != nil {
  log.Fatal(err)
}
fmt.Printf("successfully deleted object")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Delete an object
const resp = await client.storagesClient.deleteObject({
  bucket: "my-bucket",
  path: "path/to/object.txt",
});
console.log("successfully deleted object");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage delete-object [path]
```

Example:

```sh
rig storage delete-object rig://my-bucket/path/to/object.txt
```

</TabItem>
</Tabs>

## Copying objects

Copying objects can be done using the `CopyObject` endpoint. This endpoint takes a source bucket and path and a destination bucket and path. It is possible to copy files both within the same provider and across providers. Using the CLI, the copy, upload, and download functionalities are gathered under the same command. For more details see [uploading](./uploading-objects) and [downloading](./downloading-objects).

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Copy an object.
resp, err := client.Storage().CopyObject(ctx, connect.NewRequest(&storage.CopyObjectRequest{
    ToBucket: "my-bucket",
    ToPath: "path/to/object.txt",
    FromBucket: "my-other-bucket",
    FromPath: "path/to/object.txt"
}))
if err != nil {
  log.Fatal(err)
}
fmt.Printf("successfully copied object")
```

</TabItem>
<TabItem value="typescript" label="Typescript SDK">

```typescript
// Copy an object.
const resp = await client.storagesClient.copyObject({
  toBucket: "my-bucket",
  toPath: "path/to/object.txt",
  fromBucket: "my-other-bucket",
  fromPath: "path/to/object.txt",
});
console.log("successfully copied object");
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage copy from to
```

Example:

```sh
rig storage copy rig://my-bucket/path/to/object.txt rig://my-other-bucket/path/to/object.txt
```

</TabItem>
</Tabs>
