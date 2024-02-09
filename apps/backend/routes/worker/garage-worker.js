// import { parentPort, workerData } from 'worker_threads'


// const funcTest = async () => {
//     const randomValue = Math.random();
//   if (randomValue < 0.7) {
//     // Simulate a successful operation 70% of the time
//     parentPort.postMessage({message: "successfully"});
//     return Promise.resolve('Operation successful');
//   } else {
//     // Simulate an error 30% of the time
//     return Promise.reject(new Error('Operation failed'));
//   }
// }

// const retryUploading = async () => {
//     const { retry } = workerData;
//     const retryCounter = 0;

//     while(retryCounter < (retry || 1)) {
//         console.log(`try #${retryCounter}`)
//         try {
//             await funcTest();
//             break;
//         } catch (err) {
//             console.log(err);
//             console.log(`Attemp retry ${retryCounter} failed`);
//         }
//         retryCounter++;
//     }
// }

// await retryUploading();

