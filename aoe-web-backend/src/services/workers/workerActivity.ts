import { config } from '@/config'
import { TypeMaterialActivity } from '@aoe/services/workers/workerActivity'
import { kafkaProducer } from '@resource/kafkaClient'
import winstonLogger from '@util/winstonLogger'
import moment from 'moment'
import { parentPort, workerData } from 'worker_threads'

const message: TypeMaterialActivity = {
  timestamp: moment.utc().toISOString() as string,
  eduMaterialId: null,
  interaction: workerData.query.interaction
}

if (['view', 'edit', 'load'].includes(workerData.query.interaction as string)) {
  message.eduMaterialId = workerData.locals.id
  message.metadata = {
    created: workerData.locals.createdAt,
    updated: workerData.locals.updatedAt,
    organizations: workerData.locals.author
      ?.filter((obj) => obj.organizationkey)
      .map((obj) => obj.organizationkey),
    educationalLevels: workerData.locals.educationalLevels?.map((obj) => obj.educationallevelkey),
    educationalSubjects: workerData.locals.educationalAlignment?.map((obj) => obj.objectkey)
  }
}

const produceKafkaMessage = async (): Promise<void> => {
  await kafkaProducer.connect()
  await kafkaProducer.send({
    topic: config.MESSAGE_QUEUE_OPTIONS.topicMaterialActivity,
    messages: [
      {
        value: JSON.stringify(message)
      }
    ]
  })
  await kafkaProducer.disconnect()
}

produceKafkaMessage()
  .then(() => parentPort.postMessage(message))
  .catch((error) => winstonLogger.error('Message producer failed in workerSearch.ts: %o', error))
