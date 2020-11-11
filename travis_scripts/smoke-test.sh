#!/bin/bash
set -e

docker run -d -p3000:3000 --name=network-explorer $OWNER/$IMAGE_NAME:local

## Wait for the service to come online and test
wait_time=20;
for (( i=0; i < 5; i=i+1 )); do
    if ! curl -s http://127.0.0.1:3000/; then
        echo "Failed to connect"
        curl -v http://127.0.0.1:3000/
        echo "Attempting to connect to network-explorer, retrying in $wait_time seconds"
        sleep $wait_time
        wait_time=$(( 2*wait_time ))
    else
        exit 0
    fi
done
exit 1
