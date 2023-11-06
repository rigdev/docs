# Setup guide

## Kubernetes Cluster Installation

Rig shines when it gets to run in a real Kubernetes environment. It
lowers the barrier of entry for engineers as they won't have to learn the
complex APIs of Kubernetes.

### Requirements

The Rig Platform only has one dependency, and that is a database. Support is available for connecting to an existing PostgreSQL or MongoDB database.
Alternatively, a PostgreSQL database can be deployed for you as part of the installation (not recommended for production environments).

<!-- Running the Rig Platform in Kubernetes, we first need to have an available
[MongoDB](https://www.mongodb.com/) cluster, which Rig will use to store its
data. We recommend using managed services in production environments. If you
want to quickly test Rig, the Rig helm chart can install a MongoDB for
you. -->

### Installation

:::info Prerequisites
Make sure your cluster has a Cert-Manager operator installed.
:::

We will install the Rig Platform using [Helm](https://helm.sh). This also installs the Rig Operator, which enables support for Capsules within the cluster.

```bash
helm upgrade --install rig-operator rig-operator \\
  --repo https://charts.rig.dev \\
  --version ${RIG_OPERATOR_CHART_VERSION} \\
  --namespace rig-system \\
  --create-namespace
helm upgrade --install rig-platform rig-platform \\
  --repo https://charts.rig.dev \\
  --version ${RIG_PLATFORM_CHART_VERSION} \\
  --namespace rig-system \\
  --create-namespace \\
  --set postgres.enabled=true  # Remove to not start a new PostgreSQL database.
```

:::info Note
See [Kubernetes](/kubernetes) for more information about how to connect to your own database, and other configuration options.
:::

### Configuration

The Rig Operator and Platform both have a `values.yaml` file which specify how to configure their respective Helm charts. The `values` files and their defaults can be found here

- [Operator values](https://github.com/rigdev/rig/blob/main/deploy/charts/rig-operator/values.yaml)
- [Platform values](https://github.com/rigdev/rig/blob/main/deploy/charts/rig-platform/values.yaml)

To overwrite a default value when deploying, use `--set FIELD=VALUE` flags when running `helm`.