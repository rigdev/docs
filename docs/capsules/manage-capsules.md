---
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import ThemedImage from '@theme/ThemedImage';

# Manage Capsules

In this document, you’ll learn how to manage your Capsules using the CLI.

<hr class="solid" />

## Prerequisites
### A running Capsule
It is assumed that you have a capsule that is running with at least one replica.

<hr class="solid" />

## Configure network
To expose your Capsule to the public world, you need to configure its network settings. Begin by creating a `network.yaml` file inside of your application.

Next, add the following content to your file:

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

Switch out `port: 80` (application port) and `port: 8081` (external port) with your ports. We can now apply these changes to our capsule by running 

```bash
rig capsule -c <capsule-name> network configure network.yaml
```

You should now be able to access your application at [http://localhost:8081](localhost:8081).

## Restart an Instance
A Capsule runs a set of replicas called instances. Instances can be thought of as Pods in Kubernetes. In case you want to restart an instance, first fetch the ID from the instance you want to delete. This can be done by listing your instances:
  
```bash
rig capsule -c <capsule-id> instance get
``` 

To restart instance run 

```bash
rig capsule -c <capsule-id> instance restart <instance-id>
```