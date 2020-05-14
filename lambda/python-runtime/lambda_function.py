import json
import time
from monitoring_lib import monitor_cpu, monitor_ram


@monitor_cpu
@monitor_ram
def lambda_handler(event, context):
  time.sleep(4)

  return {
    'statusCode': 200,
    'body': json.dumps('Hello from Lambda!')
  }
