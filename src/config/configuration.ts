export default () => ({
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  mongodb: {
    uri: process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/tawk',
  },
  kafka: {
    brokers: (process.env['KAFKA_BROKERS'] ?? 'localhost:9092').split(','),
  },
  elasticsearch: {
    url: process.env['ELASTICSEARCH_URL'] ?? 'http://localhost:9200',
  },
});
