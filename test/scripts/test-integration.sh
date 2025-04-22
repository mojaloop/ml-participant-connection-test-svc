#!/bin/bash
set -euxo pipefail

export TEST_TTK_SVC_VERSION=v18.7.4
export TEST_TTK_UI_VERSION=v16.0.4
export TEST_TTK_CLI_VERSION=v1.5.0

export DEP_KAFKA_VERSION=3.5.0
export DEP_MYSQL_VERSION=8.0
export DEP_MONGO_VERSION=6.0.5

source ./docker/env.sh

#docker load -i /tmp/docker-image.tar

docker-compose up -d

echo "==> running integration tests"
INTEGRATION_TEST_EXIT_CODE=0
npm run test:int || INTEGRATION_TEST_EXIT_CODE="$?"
echo "==> integration tests with fspiop adapter exited with code: $INTEGRATION_TEST_EXIT_CODE"

exit $INTEGRATION_TEST_EXIT_CODE
