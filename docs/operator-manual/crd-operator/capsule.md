# Capsule Spec

This is a complete example of the `Capsule` CRD spec

```yaml
image: nginx:latest
command: ./somecommand
args:
  - arg1
  - arg2
files:
  - path: /etc/config.yaml
secret:
  key: config.yaml
  name: config
horizontalScale:
  cpuTarget:
    averageUtilizationPercentage: 80
  minReplicas: 2
  maxReplicas: 5
interfaces:
  - name: http
    port: 4747
    public:
      loadBalancer:
        nodePort: 30047
        port: 4747
  - name: ingress
    port: 5678
    public:
      ingress:
        host: http://www.example.com
serviceAccountName: name
```
