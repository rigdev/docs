import {RIG_CHART_VERSION,RIG_IMAGE_VERSION} from "../../src/constants/versions"

# Server Installation
Rig can run both in a Kubernetes environment and a local Docker environment.

## Installation: Kubernetes
Rig shines when it gets to run in a Kubernetes environment. It
lowers the barrier of entry for engineers as they won't have to learn the
complex APIs of Kubernetes.

### Requirements
To run rig in Kubernetes, we first need to have an available
[MongoDB](https://www.mongodb.com/) cluster, which Rig will use to store its
data. We recommend using managed services in production environments. If you
want to quickly test rig, the Rig helm chart can install a MongoDB for
you.

### Installation
We will install Rig using Helm. We enable the MongoDB single instance which
is shipped with the helm chart.

<pre><code className="language-bash">{`helm repo add rig https://charts.rig.dev
helm upgrade --install rig rig/rig \\
  --version ${RIG_CHART_VERSION} \\
  --namespace rig-system \\
  --create-namespace \\
  --set mongodb.enabled=true
`}
</code>
</pre>

For more detailed installation instructions on Kubernetes see the [self-hosting
Kubernetes](/kubernetes) section. For a full list of available values in the
helm chart see the [value
file](https://github.com/rigdev/rig/blob/main/deploy/charts/rig/values.yaml).

### Create an Admin user

Next step is to create yourself a new Admin user in your new Rig setup. The Rig docker image comes with a `rig-admin` tool, that can be used for exactly this:

```bash
kubectl exec --stdin --tty --namespace rig-system deploy/rig \
  -- rig-admin users create --email myemail@example.com
```

And that's it, you're now ready to login on the dashboard at [http://localhost:4747](http://localhost:4747).

## Installation: Docker

First step is creating a new `docker-compose.yaml` file. Rig has a single dependency, a Mongo database. The following `docker-compose.yaml` can be used if you want to spin up Rig, together with a Mongo database:

<pre><code className="language-yaml">{
`services:
  rig:
    image: ghcr.io/rigdev/rig:${RIG_IMAGE_VERSION}
    environment:
      RIG_AUTH_JWT_SECRET: mysecret
      RIG_CLIENT_MONGO_HOST: mongo:27017
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "4747:4747"

  mongo:
    image: "mongo:latest"
    volumes:
    - mongo-data:/data'

volumes:
  mongo-data:

networks:
  default:
    name: rig`}
</code>
</pre>

Now spin up Rig with the following command:

```bash
docker compose up -d
```

### Create an Admin user

Next step is to create yourself a new Admin user in your new Rig setup. The Rig docker image comes with a `rig-admin` tool, that can be used for exactly this:

```bash
docker compose exec -it rig rig-admin users create --email myemail@example.com
```

And that's it, you're now ready to login on the dashboard at [http://localhost:4747](http://localhost:4747).

## Configuration
For more information about how to configure Rig, see the [configuration](/configuration) section.
