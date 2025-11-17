#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

BASTION_TARGET=$(aws ec2 describe-instances \
                     --filters "Name=tag:Name,Values=*bastion*" "Name=instance-state-name,Values=running" \
                     --query "Reservations[].Instances[].InstanceId" \
                     --output text)

DB_WRITER_ENDPOINT=$(aws rds describe-db-cluster-endpoints \
                        --query "DBClusterEndpoints[?(DBClusterIdentifier=='${ENV}-web-backend' || DBClusterIdentifier=='prod-web-backend') && EndpointType=='WRITER'].Endpoint" \
                        --output text)

echo "Using bastion ${BASTION_TARGET}"
echo "To connect to DB ${DB_WRITER_ENDPOINT}"

## AWS SSM is listening to the wrong interface, so lets fix that...
daemonize /usr/bin/socat \
  tcp-listen:5432,reuseaddr,fork \
  tcp:localhost:5431

/usr/bin/aws ssm start-session \
    --target "${BASTION_TARGET}" \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters "{\"host\":[\"${DB_WRITER_ENDPOINT}\"],\"portNumber\":[\"5432\"], \"localPortNumber\":[\"5431\"]}"
