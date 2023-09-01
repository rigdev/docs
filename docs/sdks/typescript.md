---
pagination_prev: null
---

import InstallRig from '../../src/markdown/prerequisites/install-rig.md'
import SetupCli from '../../src/markdown/prerequisites/setup-cli.md'
import CreateCredential from '../../src/markdown/prerequisites/create-credential.md'

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# How to connect your Typescript application to Rig

## Overview

Rig provides the tools and infrastructure you need to develop and manage applications on Kubernetes. The Rig Typescript SDK enables access to Rig services from privileged environments (such as servers or cloud) in Golang.

<hr class="solid" />

## Installation

The Rig Typescript SDK can be installed using NPM:

```sh
npm i @rigdev/sdk
```

<hr class="solid" />

## Setup Client

To setup the client we construct it and pass in the ID of your project.

```typescript
import { Client } from "@rigdev/sdk/lib/index.js";

const projectID = "YOUR_PROJECT_ID";
const client = new Client({
  projectID: projectID,
});
client.user.list({}).then((response) => console.log(response));
```

The `Client` needs access to a Rig service-account, which you [setup like this](/service-accounts). By default the `Client` tries to read the credentials from the `RIG_CLIENT_ID` and `RIG_CLIENT_SECRET` environment variables. If these are not set, you can supply them directly using the `credentials` field to the constructor. If your code is running from inside a Rig capsule, it is possible to automatically set the environment variables by executing

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
