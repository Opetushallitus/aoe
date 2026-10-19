#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

BASTION_TARGET=$(aws ec2 describe-instances \
                     --filters "Name=tag:Name,Values=*bastion*" "Name=instance-state-name,Values=running" \
                     --query "Reservations[].Instances[].InstanceId" \
                     --output text)

echo "Using bastion ${BASTION_TARGET}"
echo "Connecting to Redis ${REDIS_ENDPOINT}"

daemonize /usr/bin/socat \
  tcp-listen:6379,reuseaddr,fork \
  tcp:localhost:6378

/usr/bin/aws ssm start-session \
    --target "${BASTION_TARGET}" \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters "{\"host\":[\"${REDIS_ENDPOINT}\"],\"portNumber\":[\"6379\"], \"localPortNumber\":[\"6378\"]}"
