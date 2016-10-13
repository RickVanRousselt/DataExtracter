var Azure = require("azure-storage");

var QueueSvc = Azure.createQueueService(process.env.table_name, process.env.azure_key);

var TableSvc = Azure.createTableService(process.env.table_name, process.env.azure_key);
 
function ConvertJsonToTask(json, partitionKey, rowKey) {
    var jsonResult = JSON.parse(json);  
    
    var entGen = Azure.TableUtilities.entityGenerator;
    var task = {
        PartitionKey: entGen.String(partitionKey),
        RowKey: entGen.String(rowKey),
        description: entGen.String(json),
        username: entGen.String(jsonResult.user.name),
        screen_name: entGen.String(jsonResult.user.screen_name),
        location: entGen.String(jsonResult.user.location),
        friends_count: entGen.String(jsonResult.user.friends_count),
        lang: entGen.String(jsonResult.user.lang),
        profile_background_image_url: entGen.String(jsonResult.user.profile_background_image_url),
        profileimage: entGen.String(jsonResult.user.profile_image_url),
        tweet_text: entGen.String(jsonResult.text),
        source: entGen.String(jsonResult.source),
        followers: entGen.String(jsonResult.user.followers_count),
		//hashtags: entGen.String(jsonResult.entities.hashtags),
        tex: entGen.String(jsonResult.text),
		created_at: entGen.String(jsonResult.created_at)

    };
    return task;
};

function Main() {
        
    QueueSvc.getMessages('incomingstreamids', function (error, result, response) {
        if (!error) {
            // Message text is in messages[0].messageText
            var message = result[0];
            if (message != null) {
                var queryArray = message.messageText.split(';');
                
                TableSvc.retrieveEntity('incomingstreamcontents', queryArray[0], queryArray[1], function (error, result, response) {
                    if (!error) {
                    // query was successful
                    }
					
                    var task = ConvertJsonToTask(result.description._, result.PartitionKey._, result.RowKey._);
                    
                    TableSvc.replaceEntity('incomingstreamcontents', task, function (error, result, response) {
                        if (!error) {
                            // Entity updated
                            QueueSvc.createQueueIfNotExists("processedstreamids",
                                function(error, result, response) {
                                    if (!error) {
                                        var queMessage = message.messageText + "|" + task.profileimage._;
                                        QueueSvc.createMessage('processedstreamids',
                                            queMessage,
                                            function(error, result, response) {
                                                if (!error) {

                                                }
                                            });
                                    }
                                });

                            QueueSvc.deleteMessage('incomingstreamids',
                                message.messageId,
                                message.popReceipt,
                                function(error, response) {
                                    if (!error) {
                                        Main();
                                    }
                                });
                        } else {
							QueueSvc.deleteMessage('incomingstreamids',
                                message.messageId,
                                message.popReceipt,
                                function (error, response) {
								if (!error) {
									Main();
								}
							});
                        }
                    });
                });
            }
        }
    });
};

function Starter()
{
    Main();
    //while (true) {
    //    setTimeout(main, 10000);
    //}
};

Starter();

