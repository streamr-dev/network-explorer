#!/bin/bash
if [ "$1" == "dev" ]; then
    # If the build is a cron build then it should tag and push a nightly build but if it is not a cronjob
    # then it is just another dev tag and push
    if [ "$TRAVIS_EVENT_TYPE" == "cron" ]; then
        # The script detects that there is a cron job through the variable TRAVIS_EVENT_TYPE which will be
        # 'cron' if the build is triggered by a cron job
        echo "Tag Nightly"
        nightly_build=nightly-$(date '+%Y-%m-%d')
        docker tag "$OWNER/$IMAGE_NAME:local" "$OWNER/$IMAGE_NAME:$nightly_build"
        docker tag "$OWNER/$IMAGE_NAME:local" "$OWNER/$IMAGE_NAME:nightly"
        ## Push Nightly
        docker push "$OWNER/$IMAGE_NAME:$nightly_build"
        docker push "$OWNER/$IMAGE_NAME:nightly"
    else
        echo "Tag dev"
        docker tag "$OWNER/$IMAGE_NAME:local" "$OWNER/$IMAGE_NAME:$1"
        ## Push dev
        docker push "$OWNER/$IMAGE_NAME:$1"
    fi
elif [ "$1" == "production" ]; then
    echo "Tag Production with $2"
    docker tag "$OWNER/$IMAGE_NAME:local" "$OWNER/$IMAGE_NAME:$2"
    ## Push Production
    docker push "$OWNER/$IMAGE_NAME:$2"
fi
