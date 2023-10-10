import {RIG_CHART_VERSION,RIG_IMAGE_VERSION} from "../../src/constants/versions"

# Platform Installation

## Local Installation

Rig can run locally in both Kubernetes (KIND) and in a local Docker environment.

:::info Prerequisites
Make sure that you have the [CLI Installed](/getting-started/cli-install).
:::

### Option 1: Docker

To create a Rig setup on your local machine within Docker, simply run the following command:

```bash
rig dev docker create
```

The above command will guide you through the installation. If anything goes wrong, you can always run the command again.

### Option 2: Kubernetes (KIND)

To easily create a Rig Kubernetes setup on your local machine, Rig comes with support for starting up a KIND cluster on your local machine. Run the following command:

```bash
rig dev kind create
```

### Next step

And that's it, you're now ready to login on the dashboard at [http://localhost:4747](http://localhost:4747).

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

We will install the Rig Platform using Helm. This also installs the Rig Operator, which enabled support for Capsules within the cluster.

<pre><code className="language-bash">{`helm repo add rig https://charts.rig.dev
helm upgrade --install rig rig/rig-platform \\
  --version ${RIG_CHART_VERSION} \\
  --namespace rig-system \\
  --create-namespace \\
  --set postgres.enabled=true  # Remove to not start a new PostgreSQL database.
`}
</code>
</pre>

:::info Note
See [Kubernetes](/kubernetes) for more information about how to connect to your own database, and other configuration options.
:::

### Setup Rig

The next step is to do some simple setup of Rig. This amounts to creating yourself a new Admin user and create a proejct. The Rig docker image comes with a `rig-admin` tool, that can be used for exactly this:

```bash
kubectl exec -it --namespace rig-system deploy/rig-platform \
  -- rig-admin init
```

## Configuration

For more information about how to configure Rig, see the [configuration](/configuration) section.
