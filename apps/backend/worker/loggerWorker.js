import { parentPort, workerData } from 'worker_threads'
import dotenv from 'dotenv';
import { batchSendNotification } from '../utils/notification.js';
import connectFireBase from '../config/firebase.js';
import setupDatabase, { dbNative } from "../config/database.js";
import { logActionForAddStaff } from '../utils/loggerUtil.js';
dotenv.config();

setupDatabase();

const ADD_STAFF = 0;

const logAction = async () => {
    try {
        
        const {type, data} = workerData;

        switch (type) {
            case ADD_STAFF:
                logActionForAddStaff();
                break;
        
            default:
                break;
        }

        parentPort.postMessage({message: 'Send notification success'});
    } catch (error) {
        console.log(error);
        console.log("Error occurred in logActionWorker")
    }
    
}

await logAction();


