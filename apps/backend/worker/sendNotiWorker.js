import { parentPort, workerData } from 'worker_threads'
import dotenv from 'dotenv';
import { socketIO } from '../config/websocket.js';
dotenv.config();

const sendNotification = async () => {
    const data = workerData;

    socketIO.on('connection', (socket) => {
        socket.emit(data.userId, {
            message: 'Your order has been successful',
            confirmedOrder: data.completedOrder,
            rejectedOrder: data.unCompletedOrder
        })

        socket.on('disconnect', () => {
            socket.disconnect();
            console.log('User disconnected');
        });
    });

    parentPort.postMessage({message: 'Send notification success'});
}

await sendNotification();


