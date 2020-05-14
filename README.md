# radon-monitoring-tool

|         Items         |                                                 Contents                                                        |
| ----------------------|-----------------------------------------------------------------------------------------------------------------|
|     Description       | The monitoring tool can help RADON users to monitor the resource consumption of serverless FaaS applications.   |
|        Contact        |                                      Giorgos Giotis ([@giopnd](https://github.com/giopnd))                      |



# Monitoring components

The Monitoring tool is composed of the following parts: a Prometheus server, a service discovery (Consul) cluster, a Grafana instance and multiple Prometheus Pushgateway instances. 

### Prometheus server
A public instance is available on: `http://3.127.254.144:9090`

### Service Discovery (Consul) cluster
A public instance is available on: `http://3.127.254.144:8500`

### Grafana Dashboard
A public instance is available on: `http://3.127.254.144:3000`

### Prometheus Pushgateway
The Prometheus Pushgateway exists to allow ephemeral and batch jobs to expose their metrics to Prometheus. Since these kinds of jobs may not exist long enough to be scraped, they can instead push their metrics to a Pushgateway. The Pushgateway then exposes these metrics to Prometheus.

Run the Ansible playbook to install a push gateway instance and to automatically advertise its endpoint on the service discovery agent. Then the Prometheus server will auto discover the newly registered/advertised push gateway endpoint and start scraping it to collect exposed metrics. The exposed metrics are then available on the visualisation dashboard. 

### AWS Lambda integration
#### Monitoring client
To monitor an AWS Lambda function import the RADON monitoring lib and simply annotate the lambda_function:::lambda_handler, i.e:
> @monitor_ram  
> @monitor_cpu

The dependencies can be provided to AWS Lambda via layer like:  
`$ pip install --target ./package/python prometheus_pushgateway`  
`$ pip install --target ./package/python psutil`  
`$ zip -r9 function.zip package/`  
`$ aws lambda publish-layer-version --layer-name monitoring_client --zip-file fileb://function.zip --compatible-runtimes ruby2.5`  
 or packaged with the lambda code or simply reference a public layer: `arn:aws:lambda:eu-central-1:510790361559:layer:radon_monitoring_client:2`  
 
The RADON monitoring client needs to be registered to its corresponding push gateway. This is achieved by injectng an Environment variable to the AWS Lambda function with key: `PUSH_GATEWAY_HOST`. 
