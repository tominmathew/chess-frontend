const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'chess-game',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();

async function sendMoveToKafka(move) {
    await producer.connect();
    await producer.send({
        topic: 'chess-moves',
        messages: [
            { value: JSON.stringify(move) },
        ],
    })
    await producer.disconnect();
}

module.exports = { sendMoveToKafka };