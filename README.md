# DataExtracter

This is part of a bigger application. Check out [TwitStreamReader](../../../../TwitStreamReader) and [PictureTranslater](../../../../PictureTranslater)

This node JS code in a docker container will use an Azure Queue to see which items it needs to process. It will get an item to process from an Azure Storage Table which is just a JSON and extract the data. It will then update the Table and when it is finished create an entry inside another Queue.

The following environment variables are required to have this run correctly.

    "azure_key": <Azure key to the storage account>,
    "table_name": <The name of the table in the Azure Storage account>
    
    
This repo is created to run inside a [docker container](https://hub.docker.com/r/rickvanrousselt/dataextracter). This docker container can then be deployed to the [Azure Container Service](https://azure.microsoft.com/en-us/services/container-service/) to deploy the entire application.

To run this inside ACS the following JSON can be used inside Marathon to run the container.

```javascript
{
  "id": "dataextracter",
  "cmd": null,
  "cpus": 0.1,
  "mem": 128,
  "disk": 0,
  "instances": 1,
  "container": {
    "type": "DOCKER",
    "volumes": [],
    "docker": {
      "image": "rickvanrousselt/dataextracter",
      "network": "HOST",
      "privileged": false,
      "parameters": [],
      "forcePullImage": false
    }
  },
  "env": {
     <Enter here the environment variables described above>
  },
  "portDefinitions": [
    {
      "port": 10001,
      "protocol": "tcp",
      "labels": {}
    }
  ]
}
```
