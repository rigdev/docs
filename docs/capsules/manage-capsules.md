---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ThemedImage from '@theme/ThemedImage';

# Manage Capsules using the CLI

## Overview
In this document, you’ll learn how to manage your Capsules using the CLI.

<hr class="solid" />

## Prerequisites
### A running Capusle
It is assumed that you have a capsule that is running with at least one replica.


<hr class="solid" />

## Configure network
To expose your Capsule to the public world, we need to configure its network settings. Begin by creaing a `network.yaml` file inside of your application.

Next add the following content to your file:

```yaml
interfaces:
  - name: http
    port: 80
    public:
      enabled: true
      method:
        load_balancer:
          port: 8081
```

Switch out the `port: 80` (application port) and `port: 8081` (external port) with your own ports. We can now apply these changes to our capsule by running `rig capsule configure-network <capsule-name> network.yaml`. You should now be able to access your application on [http://localhost:8081](localhost:8081).

### Adding Middleware
Rig can inject Middleware into your application. This Middleware will run before any client request hits your endpoint. For instance, let's imagine we only want to allow users who are logged in to access our application. We simple turn on this functionality by adding the following to our `network.yaml`:
```yaml
interfaces:
  - name: http
    port: 80
    public:
      enabled: true
      method:
        load_balancer:
          port: 8081
      authentication:
        enabled: true
        default:
          allow_authorized: {}
```

Update the network configuration by running `rig capsule configure-network <capsule-name> network.yaml`. Let's imagine that we have a couple of endpoints that does not require authetnication. We can allow unauthorized requests to access `/auth/login`, by adding the following to our `network.yaml`:
```yaml
interfaces:
  - name: http
    port: 80
    public:
      enabled: true
      method:
        load_balancer:
          port: 8081
      authentication:
        enabled: true
        default:
          allow_authorized: {}
        http:
          - path: "/auth/login"
            auth:
              allow_any: {}

```

Update the network configuration to roll out the new changes.

## Restart an Instance
A Capsule runs a set of replicas that we call instances. Instances can be though of as Pods in Kuberbetes. In case you want to restart an instance, first fetch the ID from the instance you want to delete. This can be done by listing your instances `rig capsule list-instances`. This will return an output like the following:

```bash
+-----------------+-------+---------------+----------------------+---------------------+---------------+
| INSTANCES (2)   | BUILD |         STATE | CREATED AT           |              UPTIME | RESTART COUNT |
+-----------------+-------+---------------+----------------------+---------------------+---------------+
| acme-instance-1 |     1 | STATE_RUNNING | 2023-07-24T18:20:03Z | 13h37m13.949423042s |             0 |
| acme-instance-0 |     1 | STATE_RUNNING | 2023-07-24T18:20:03Z | 13h37m14.495876445s |             0 |
+-----------------+-------+---------------+----------------------+---------------------+---------------+
```

`BUILD` tells you what build your instance is runnig and `STATE` tells you what state your instance is in (running, failing, etc). To restart instaince 1, run `rig capsule restart-instance acme 1`.