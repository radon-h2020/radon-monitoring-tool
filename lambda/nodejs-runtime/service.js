const client = require("prom-client");
const osu = require("node-os-utils");
const os = require("os-utils");
require("dotenv").config();

const ram_metric = new client.Gauge({
  name: "memory_usage_bytes",
  help: "Memory usage in bytes.",
});
const cpu_metric = new client.Gauge({
  name: "cpu_usage_percent",
  help: "CPU usage percent.",
});

const push_gateway_host = process.env.PUSH_GATEWAY_HOST;

if (!push_gateway_host) {
  throw new Error('You must have "PUSH_GATEWAY_HOST" variable');
}

const gateway = new client.Pushgateway(push_gateway_host);

const sleep = (milis) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, milis);
  });
};

const start = async (interval) => {
  // const cpu_usage = await osu.cpu;
  const ram_usage = await osu.mem;
  while (true) {
    getRAMUsageBytes(ram_usage);
    getCPUUsagePercentage();
    //index = index + 1;

    await sleep(interval);
  }
};

const getCPUUsagePercentage = () => {
  //const cpu = _cpu.average();
  // const cpu = osu.cpu
  // const value = cpu.avgIdle / cpu.avgTotal;
  // _cpu.usage()
  // .then(cpuPercentage => {
  //   cpu_metric.set(cpuPercentage);
  //   console.log(cpu_metric);
  //   gateway.push(
  //     { jobName: `anesid-nodeJS-monitored-function_CPU_${index}` },
  //     (err, resp, body) => {}
  //   );

  //   // console.log(cpuPercentage) // 10.38
  // })
  os.cpuUsage(function (v) {
    console.log("CPU Usage (%): " + v);
    cpu_metric.set(v);

    gateway.push(
      { jobName: "nodeJS-monitored-function_cpu" },
      (err, resp, body) => {}
    );
  });
};

const getRAMUsageBytes = async (_ram) => {
  const ram = await _ram.used();
  const value = ram.usedMemMb * 1024 * 1024;

  ram_metric.set(value);
  console.log(ram_metric);
  gateway.push(
    { jobName: "nodeJS-monitored-function_ram" },
    (err, resp, body) => {}
  );
};

start(500);
