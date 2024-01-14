import dotenv from 'dotenv';
import { set, connect } from 'mongoose';

// eslint-disable-next-line no-undef
const MONGOURI = process.env.MONGODB_URI;
set('strictQuery', false);
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await connect(MONGOURI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        // eslint-disable-next-line no-undef
        process.exit(1);
    }
};

export default connectDB;
