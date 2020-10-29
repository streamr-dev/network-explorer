# Streamr Network Explorer

Endpoints for tracker: https://github.com/streamr-dev/network/blob/master/bin/tracker.js#L77-L120

# Running

Before starting locally, make sure the `streamr-docker-dev` stack is running.

To use the app using the local dev environment, run:

```
npm ci
npm start
```

Note that the explorer will only show streams that have some data running.

To use the staging config:

```
npm ci
BUILD_ENV=staging npm run start-env
```
