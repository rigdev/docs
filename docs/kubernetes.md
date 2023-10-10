---
sidebar_position: 1
pagination_next: null
pagination_prev: null
---

import {RIG_CHART_VERSION} from "../src/constants/versions"

# Kubernetes

## Port-forward

When rig is running you can reach the rig API by doing a portforward or
if inside the cluster you can use the service directly.

```bash
kubectl port-forward -n rig-system svc/rig-platform-svc 4747
```

<hr class="solid" />

## Database setup

The Rig Platform uses a database to store its data, support both PostgreSQL and MongoDB. To connect to your own database, use the steps below.

### PostgreSQL

To connect to your own PostgreSQL database, you need to fill out the following section of your Helm values file:

```yaml
rig:
  client:
    postgres:
      host: <host-and-port>
      user: <username>
      password: <password>
      insecure: <set to true if insecure>
      database: rig
```

The `rig-platform` container will at startup connect to the database, and print any error there may be if wrongly configured.

### MongoDB

Alternatively, MongoDB can be used. Supply the following Helm values to configure your database.

```yaml
rig:
  client:
    mongo:
      host: <host-and-port>
      user: <username>
      password: <password>

  repository:
    capsule:
      store: mongodb
    credential:
      store: mongodb
    group:
      store: mongodb
    user:
      store: mongodb
    session:
      store: mongodb
    project:
      store: mongodb
    secret:
      store: mongodb
    cluster_config:
      store: mongodb
    service_account:
      store: mongodb
    verification_code:
      store: mongodb
```

<hr class="solid" />

## Additional configuration options

For more detailed installation instructions on Kubernetes see the [self-hosting
Kubernetes](/kubernetes) section. For a full list of available values in the
helm chart see the [value
file](https://github.com/rigdev/rig/blob/main/deploy/charts/rig-platform/values.yaml).
