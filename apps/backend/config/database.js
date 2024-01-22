import dotenv from 'dotenv';
import { set, connect } from 'mongoose';

// eslint-disable-next-line no-undef
const MONGOURI = process.env.PROD_STATUS === 'DEV' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;
set('strictQuery', false);
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await connect(MONGOURI, { useNewUrlParser: true });
        console.log(`MongoDB Connected: ${conn.connection.host} - ${process.env.PROD_STATUS}`);
    } catch (error) {
        console.log(error);
        // eslint-disable-next-line no-undef
        process.exit(1);
    }
};

export default connectDB;
