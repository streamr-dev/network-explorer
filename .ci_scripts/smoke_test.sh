#!/bin/bash
set -e

docker run -dit -p 3000:80 --name=network-explorer $OWNER/$IMAGE_NAME:local

## Wait for the service to come online and test
wait_time=10;
for (( i=0; i < 5; i=i+1 )); do
    if ! curl --silent --show-error http://localhost:3000/; then
        echo "Attempting to connect to network-explorer, retrying in $wait_time seconds"
        sleep $wait_time
        wait_time=$(( 2*wait_time ))
    else
        exit 0
    fi
done
exit 1
