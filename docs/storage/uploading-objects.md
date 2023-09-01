import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Uploading Objects using the SDK or CLI

## Overview

This document provides instruction on how to upload objects to Rig Storage using the SDK or CLI.

<hr class="solid" />

## Uploading Objects

The `UploadObject` endpoint takes no parameters, and returns a StreamClient, which is then used to upload chunks of data using the `Send` method. The first chunk of data sent must contain the object meta data, and the subsequent chunks can then contain the object data. For the CLI, the upload functionality is gathered under the copy command, where the from path is the local file path, and the to path is the path to the object in Rig Storage. In the CLI it is also possible to specify a recursive flag, that will upload all files in a directory.

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
// Open file from path
from := "./file.txt"
file, err := os.Open(from)
if err != nil {
  log.Fatal(err)
}

defer file.Close()

s, err := file.Stat()
if err != nil {
  log.Fatal(err)
}

mimeData := make([]byte, 512)
n, err := file.Read(mimeData)
if err != nil {
  log.Fatal(err)
}

if _, err := file.Seek(0, 0); err != nil {
  log.Fatal(err)
}

// Create Metadata object
metaData := &storage.UploadObjectRequest_Metadata{
  Bucket:      "my-bucket",
  Path:        "path/to/object.txt",
  Size:        uint64(len(data)),
  ContentType: http.DetectContentType(mimeData[:n]),
}

// Get the stream client
client := client.Storage().UploadObject(ctx)

// Send the metadata
err := client.Send(&storage.UploadObjectRequest{Request: &storage.UploadObjectRequest_Metadata_{Metadata: metaData}})
if err != nil {
  log.Fatal(err)
}

// Send the data
buffer := make([]byte, 64*1024)
for {
    n, err := file.Read(buffer)
    if err == io.EOF {
        _, err := client.CloseAndReceive()
        if err != nil {
            log.Fatal(err)
        }

        return
    } else if err != nil {
        log.Fatal(err)
    }

    if err := client.Send(&storage.UploadObjectRequest{Request: &storage.UploadObjectRequest_Chunk{Chunk: buffer[:n]}}); err != nil {
        log.Fatal(err)
    }
}
```

</TabItem>
<TabItem value="cli" label="CLI">

```sh
rig storage copy [from] [to] --recursive
```

Example:

```sh
rig storage copy ./file.txt ns://my-bucket/path/to/object.txt
```

</TabItem>
</Tabs>
