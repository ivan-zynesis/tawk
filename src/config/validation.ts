import Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().default('mongodb://localhost:27017/tawk'),
  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  ELASTICSEARCH_URL: Joi.string().default('http://localhost:9200'),
});
