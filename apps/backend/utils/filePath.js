import path from 'path';

export const getWorkerPath = (workerFileName) => {
    const publicPath = path.join(process.cwd(), 'worker', workerFileName);
    return publicPath;
}