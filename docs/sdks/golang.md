---
pagination_prev: null
---

import InstallRig from '../../src/markdown/prerequisites/install-rig.md'
import SetupCli from '../../src/markdown/prerequisites/setup-cli.md'
import CreateCredential from '../../src/markdown/prerequisites/create-credential.md'

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to connect your Go application to Rig

## Overview

Rig provides the tools and infrastructure you need to develop and manage applications on Kubernetes. The Rig Golang SDK enables access to Rig services from privileged environments (such as servers or cloud) in Golang.

<hr class="solid" />

## Installation

The Rig Golang SDK can be installed using the go install utility:

<Tabs>
<TabItem value="sh" label="Terminal">

```sh
# Install the latest version:
go get github.com/rigdev/rig-go-sdk@latest

# Or install a specific version:
go get github.com/rigdev/rig-go-sdk@x.x.x
```

</TabItem>
</Tabs>

<hr class="solid" />

## Setup Client

To setup the client use the `rig.NewClient` method:

<Tabs>
<TabItem value="go" label="Golang SDK">

```go
package main

import (
	"context"
	"fmt"
	"log"

	"github.com/bufbuild/connect-go"
	rig "github.com/rigdev/rig-go-sdk"
	"github.com/rigdev/proto/go/api/v1/user"
)

func main() {
	client := rig.NewClient()

	// you can now make requests to Rig
	if _, err := client.User()().Create(context.Background(), connect.NewRequest(&user.CreateRequest{
		Initializers: []*user.Update{},
	})); err != nil {
		log.Fatal(err)
	}

	fmt.Println("success")
}
```

</TabItem>
</Tabs>

The `rig.Client` needs access to a Rig service-account, which you [setup like this](/service-accounts). By default the `rig.Client` tries to read the credentials from the `RIG_CLIENT_ID` and `RIG_CLIENT_SECRET` environment variables. If these are not set, you can supply them directly using the `WithClientCredentials` option to the `NewClient` function. If your code is running from inside a Rig capsule, it is possible to automatically set the environment variables by executing

```bash
rig capsule config [CAPSULE_NAME] --auto-add-service-account
```

Then you don't have to explicitly supply credentials or set environment variables.

## Next Steps

Now that you have a working `rig.Client` with authorization to communicate to the Rig backend, you are ready to use the various modules

- [User Management](/users)
- [Authentication](/auth)
- [Database](/database)
- [Storage](/storage)

You can also check out our examples which builds (small) complete applications using the Rig platform and Go SDK

- [User Management in a TODO-list app](/examples/todo)
- [OAuth2/Social Login](/examples/oauth)
- [Database demo](/examples/database)
