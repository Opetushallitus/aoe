package fi.csc.processor.utils;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.config.SslConfigs;

import java.util.Map;

public class KafkaConfigUtil {

    private KafkaConfigUtil() {
        // no instance creation allowed
    }

    public static Map<String, String> saslConfig(String trustStorePassword, String trustStoreLocation) {
        return Map.of(
                SslConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG, trustStoreLocation,
                SslConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, trustStorePassword,
                CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, "SASL_SSL",
                SaslConfigs.SASL_MECHANISM, "AWS_MSK_IAM",
                SaslConfigs.SASL_JAAS_CONFIG, "software.amazon.msk.auth.iam.IAMLoginModule required;",
                SaslConfigs.SASL_CLIENT_CALLBACK_HANDLER_CLASS, "software.amazon.msk.auth.iam.IAMClientCallbackHandler");
    }
}
