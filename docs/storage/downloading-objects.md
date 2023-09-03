import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Downloading Objects

The `DownloadObject` endpoint takes a bucket and a path as input and returns a StreamClient, which is then used to receive chunks of data using the `Receive` method. For the CLI, the download functionality is gathered under the copy command, where the to-path is the local file path, and the from-path is the path of the object in Rig Storage. In the CLI it is also possible to specify a recursive flag, that will download all files in a directory.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Create file locally
if err := os.MkdirAll(filepath.Dir("./file.txt"), os.ModePerm); err != nil {
  log.Fatal(err)
}

file, err := os.Create("./file.txt")
if err != nil {
  log.Fatal(err)
}

defer file.Close()

// Get stream client
client err := sc.DownloadObject(ctx, &connect.Request[storage.DownloadObjectRequest]{
  Msg: &storage.DownloadObjectRequest{
  Bucket: "my-bucket",
  Path:   "path/to/object.txt",
  },
})
if err != nil {
  log.Fatal(err)
}
defer client.Close()

// Receive chunks of data
for client.Receive() {
  res := client.Msg()
  n, err := file.Write(res.GetChunk())
  if err != nil {
    log.Fatal(err)
  }
}

// Error handling
if c.Err() == io.EOF {
    return
} else if c.Err() != nil {
    log.Fatal(client.Err())
} else {
    return
}
```

</TabItem>

<TabItem value="cli" label="CLI">

```sh
rig storage copy [from] [to] --recursive
```

Example:
```sh
rig storage copy ns://my-bucket/path/to/object.txt ./file.txt
```
</TabItem>
</Tabs>