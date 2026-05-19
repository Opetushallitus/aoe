#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

BASTION_TARGET=$(aws ec2 describe-instances \
                     --filters "Name=tag:Name,Values=*bastion*" "Name=instance-state-name,Values=running" \
                     --query "Reservations[].Instances[].InstanceId" \
                     --output text)

DOCDB_CLUSTER_ID=$(aws cloudformation describe-stack-resources \
                      --stack-name AOEDocumentDB \
                      --query "StackResources[?LogicalResourceId=='AoeDocumentDB'].PhysicalResourceId" \
                      --output text)

DOCDB_ENDPOINT=$(aws docdb describe-db-clusters \
                    --db-cluster-identifier "${DOCDB_CLUSTER_ID}" \
                    --query "DBClusters[0].Endpoint" \
                    --output text)

echo "Using bastion ${BASTION_TARGET}"
echo "Connecting to DocumentDB ${DOCDB_ENDPOINT}"

daemonize /usr/bin/socat \
  tcp-listen:27017,reuseaddr,fork \
  tcp:localhost:27016

/usr/bin/aws ssm start-session \
    --target "${BASTION_TARGET}" \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters "{\"host\":[\"${DOCDB_ENDPOINT}\"],\"portNumber\":[\"27017\"], \"localPortNumber\":[\"27016\"]}"
