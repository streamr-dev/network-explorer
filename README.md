# Streamr Network Explorer

Endpoints defined are found here: https://github.com/streamr-dev/network/blob/master/bin/tracker.js#L77-L120

And you can test out with, e.g.: curl http://corea1.streamr.network:11111/topology

The endpoint is only available via office network / VPN

# Running

With `streamr-docker-dev`:

```
npm start
```

Staging:

```
BUILD_ENV=staging npm run start-env
```
