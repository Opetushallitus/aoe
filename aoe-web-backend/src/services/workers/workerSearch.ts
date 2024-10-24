import config from '@/config';
import { TypeSearchRequest } from '@aoe/services/workers/workerSearch';
import { kafkaProducer } from '@resource/kafkaClient';
import winstonLogger from '@util/winstonLogger';
import moment from 'moment';
import { parentPort, workerData } from 'worker_threads';
// import { createHash } from 'crypto';

const message: TypeSearchRequest = {
  // sessionId: createHash('md5').update(workerData.headers['cookie']).digest('hex') as string,
  timestamp: workerData.body.timestamp ? workerData.body.timestamp : (moment.utc().toISOString() as string),
  keywords: workerData.body.keywords,
  filters: workerData.body.filters,
};

const produceKafkaMessage = async (): Promise<void> => {
  await kafkaProducer.connect();
  await kafkaProducer.send({
    topic: config.MESSAGE_QUEUE_OPTIONS.topicSearchRequests,
    messages: [
      {
        value: JSON.stringify(message),
      },
    ],
  });
  await kafkaProducer.disconnect();
};

produceKafkaMessage()
  .then(() => parentPort.postMessage(message))
  .catch((error) => winstonLogger.error('Message producer failed in workerSearch.ts: %o', error));
