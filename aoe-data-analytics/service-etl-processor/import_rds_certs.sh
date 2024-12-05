#!/bin/sh
#
# sourced from AWS documentation:
# https://docs.aws.amazon.com/documentdb/latest/developerguide/connect_programmatically.html

if [ -z "$TRUST_STORE_PASSWORD" ]; then
  echo "ERROR: TRUST_STORE_PASSWORD is not set."
  exit 1
fi

mydir=/certs
truststore=${mydir}/rds-truststore.jks
storepassword="$TRUST_STORE_PASSWORD"

mkdir -p ${mydir}

cp "$JAVA_HOME"/lib/security/cacerts ${truststore}
chmod 644 ${truststore}

keytool -storepasswd -keystore ${truststore} -storepass changeit -new "${storepassword}"

curl -sS "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem" > ${mydir}/global-bundle.pem

awk 'split_after == 1 {n++;split_after=0} /-----END CERTIFICATE-----/ {split_after=1}{print > "rds-ca-" n ".pem"}' < ${mydir}/global-bundle.pem

for CERT in rds-ca-*; do
  alias=$(openssl x509 -noout -text -in "$CERT" | perl -ne 'next unless /Subject:/; s/.*(CN=|CN = )//; print')
  echo "Importing $alias"
  keytool -import -file "${CERT}" -alias "${alias}" -storepass "${storepassword}" -keystore ${truststore} -noprompt
  rm "$CERT"
done

rm ${mydir}/global-bundle.pem
