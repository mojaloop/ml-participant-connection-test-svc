#!/bin/sh

# Retrieve the external IP address of the host machine (on macOS)
# or the IP address of the docker0 interface (on Linux)
get_external_ip() {
  if [ "$(uname)" = "Linux" ]; then
    echo "$(ip addr show docker0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)"
  else
    # Need to find a way to support Windows here
    echo "$(route get ifconfig.me | grep interface | sed -e 's/.*: //' | xargs ipconfig getifaddr)"
  fi
}

# set/override dynamic variables
export REDIS_CLUSTER_ANNOUNCE_IP=$(get_external_ip)
export TEST_TTK_SVC_VERSION=v18.7.4
export TEST_TTK_UI_VERSION=v16.0.4
export TEST_TTK_CLI_VERSION=v1.5.0

export DEP_KAFKA_VERSION=3.5.0
export DEP_MYSQL_VERSION=8.0
export DEP_MONGO_VERSION=6.0.5
