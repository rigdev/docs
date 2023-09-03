---
sidebar_position: 1
pagination_next: null
pagination_prev: null
---

import {RIG_CHART_VERSION} from "../src/constants/versions"

# How to install Rig on Kubernetes
Rig shines when it gets to run in a Kubernetes environment. It
lowers the barrier of entry for engineers as they won't have to learn the
complex APIs of Kubernetes.

## Run Rig in a local Kubernetes environment

Rig can be run locally using [kind](https://kind.sigs.k8s.io/). A local Kubernetes environment is easy to spin up using kind.

```bash
kind create cluster
```

The installation instructions do not differ whether you choose to test
Rig in a local Kubernetes environment or a real Kubernetes environment.
<hr class="solid" />

## Dependencies
To run Tig, we first need to have an available
[MongoDB](https://www.mongodb.com/) cluster and [Minio](https://min.io/) for
object storage. We recommend using managed services in production
environments. If you don't mind running these services your self follow along
for instructions on how to install and use their respective Kubernetes operators.

### MongoDB

Rig relies on Mongodb. An easy way to get running quickly is to use the
community-operator.

```bash
helm repo add mongodb https://mongodb.github.io/helm-charts
helm upgrade --install mongodb-community-operator mongodb/community-operator \
  --namespace rig-system \
  --create-namespace
```

Create a MongoDB cluster using the operator `kubectl apply` a file with the
following contents.

```yaml
apiVersion: mongodbcommunity.mongodb.com/v1
kind: MongoDBCommunity
metadata:
  name: mongodb
  namespace: rig-system
spec:
  members: 1
  type: ReplicaSet
  version: "6.0.5"
  security:
    authentication:
      modes: ["SCRAM"]
  users:
    - name: mongodb
      db: admin
      passwordSecretRef:
        name: mongodb-password
      roles:
        - name: clusterAdmin
          db: admin
        - name: userAdminAnyDatabase
          db: admin
        - name: readWriteAnyDatabase
          db: admin
      scramCredentialsSecretName: my-scram
  additionalMongodConfig:
    storage.wiredTiger.engineConfig.journalCompressor: zlib
---
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-password
  namespace: rig-system
type: Opaque
stringData:
  password: mongodb
```

### Minio

We use minio for the built-in docker registry. Minio can likewise be setup using the
official operator. The minio-operator helm repo also has a chart for quickly
setting up a tenant.

```bash
helm repo add minio-operator https://operator.min.io
helm upgrade --install minio-operator minio-operator/operator \
  --namespace minio-operator \
  --create-namespace
helm upgrade --install minio minio-operator/tenant \
  --namespace rig-system \
  --create-namespace \
  --set tenant.name="minio" \
  --set "tenant.pools[0].servers=1" \
  --set "tenant.pools[0].volumesPerServer=1"
```
<hr class="solid" />

## Installation

With the dependencies installed and running, we can setup Rig by installing
the rig helm chart.

<!--- TODO: validate if this work with the defaults of the chart or adjust
accordingly --->

<pre><code className="language-bash">{`helm repo add rig https://charts.rig.dev
helm upgrade --install rig rig/rig \\
  --version ${RIG_CHART_VERSION} \\
  --namespace rig-system \\
  --create-namespace
`}</code></pre>

<hr class="solid" />

## Port-forward

When rig is running you can reach the rig API by doing a portforward or
if inside the cluster you can use the service directly.

```bash
kubectl port-forward svc/rig 4747:4747
```
