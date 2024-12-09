import config from '@/config';
import { Kafka, Partitioners, Producer } from 'kafkajs';
import { generateAuthToken } from 'aws-msk-iam-sasl-signer-js';

const isProd = process.env.NODE_ENV === 'production';

const kafka: Kafka = new Kafka({
  clientId: config.MESSAGE_QUEUE_OPTIONS.clientId as string,
  brokers: config.MESSAGE_QUEUE_OPTIONS.brokerServers.split(',') as string[],
  ...(isProd
    ? {
        ssl: true,
        sasl: {
          mechanism: 'oauthbearer',
          oauthBearerProvider: () => oauthBearerTokenProvider(config.MESSAGE_QUEUE_OPTIONS.region),
        },
      }
    : {}),
});

async function oauthBearerTokenProvider(region) {
  // Uses AWS Default Credentials Provider Chain to fetch credentials
  const authTokenResponse = await generateAuthToken({ region });
  return {
    value: authTokenResponse.token,
  };
}

export const kafkaProducer: Producer = kafka.producer({
  allowAutoTopicCreation: true,
  createPartitioner: Partitioners.DefaultPartitioner,
  transactionTimeout: 60000,
});

export default {
  kafkaProducer,
};
