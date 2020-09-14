import os
import psutil
import time
from prometheus_client import CollectorRegistry, Gauge, push_to_gateway
from threading import Thread

ram_metric = Gauge("memory_usage_bytes", "Memory usage in bytes.", )
cpu_metric = Gauge("cpu_usage_percent", "CPU usage percent.", )

push_gateway_host = os.environ.get('PUSH_GATEWAY_HOST', None)
if not push_gateway_host:
  raise ValueError('You must have "PUSH_GATEWAY_HOST" variable')


# collect CPU metrics from lambda function and
# push them to Prometheus push gateway.
def collect_push_metrics_cpu(event, context):
  while True:
    time.sleep(0.5)

    registry = CollectorRegistry()
    # register the metric collector
    registry.register(cpu_metric)

    for c, p in enumerate(psutil.cpu_percent(interval=1, percpu=True)):
      cpu_metric.set(p)

    push_to_gateway(push_gateway_host, job=context.function_name + '_cpu',
                    registry=registry)


# collect MEMORY metrics from lambda function and
# push them to Prometheus push gateway.
def collect_push_metrics_ram(event, context):
  while True:
    time.sleep(0.5)

    registry = CollectorRegistry()
    # register the metric collector
    registry.register(ram_metric)

    ram = psutil.virtual_memory()
    ram_metric.set(ram.used)

    push_to_gateway(push_gateway_host, job=context.function_name + '_ram',
                    registry=registry)


# decorator to patch a RADON monitoring (CPU) threaded task
# on a AWS Lambda function
def monitor_cpu(func):
  def wrapper(*args, **kw):
    func_hl = Thread(target=collect_push_metrics_cpu, args=args)
    func_hl.start()
    return func(*args, **kw)

  return wrapper


# decorator to patch a RADON monitoring (MEMORY) threaded task
# on a AWS Lambda function
def monitor_ram(func):
  def wrapper(*args, **kw):
    func_hl = Thread(target=collect_push_metrics_ram, args=args)
    func_hl.start()
    return func(*args, **kw)

  return wrapper
