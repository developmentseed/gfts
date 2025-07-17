# Helm chart for GFTS webapp

This helm chart handles the deployment of the GFTS webapp, it's ingress tied to a static IP and an oauth proxy in front of it.

First we need to set some secrets:

```bash
export OAUTH2_PROXY_CLIENT_SECRET=
export OAUTH2_PROXY_COOKIE_SECRET=
export OAUTH2_PROXY_REDIS_SECRET=
```

Then we need to create the values.yaml substituting the secrets:

```bash
envsubst < values-template.yaml > values.yaml
```

And finally we can deploy the chart:

```bash
helm upgrade --install --namespace webapp --create-namespace webapp .
```


## Set NTP in kubernetes node

```bash
kubectl get nodes -o wide
kubectl debug node/gfts-webapp-xxxxx-xxxxx -it --image=busybox -- chroot /host
nano /etc/systemd/timesyncd.conf
systemctl restart systemd-timesyncd
