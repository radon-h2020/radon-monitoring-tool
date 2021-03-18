const { Worker } = require("worker_threads");

const run = () => {
  const worker = new Worker("./service/service.js", {});
  worker.on("message", (message) => {
    console.log("Worker - Message:", message);
  });

  worker.on("error", (err) => {
    console.log("Worker - Error", err);
  });

  worker.on("exit", (code) => {
    if (code !== 0) {
      throw new Error(`Worker stopped with exit code ${code}`);
    }
    console.log("Worker - Stopped.");
    process.exit(); // terminate program on worker stop
  });
  return worker;
};

module.exports = { run };
