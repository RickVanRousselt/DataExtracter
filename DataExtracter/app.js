var azure = require('azure-storage');

var queueSvc = azure.createQueueService('twitstream', '525tGSMvxz9I4mir3ucxqmdaUJTEjNLVNC9UIyVWYudHrU3jU2Pi7YCYLOVcoWj6YyI08DW8SGp8CrVpIrF2iQ==');

var tableSvc = azure.createTableService('twitstream', '525tGSMvxz9I4mir3ucxqmdaUJTEjNLVNC9UIyVWYudHrU3jU2Pi7YCYLOVcoWj6YyI08DW8SGp8CrVpIrF2iQ==');

function convertJsonToTask(json, partitionKey, rowKey) {
    var jsonResult = JSON.parse(json); 
    
    var entGen = azure.TableUtilities.entityGenerator;
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
		hashtags: entGen.String(jsonResult.entities.hashtags),
        tex: entGen.String(jsonResult.text),
		created_at: entGen.String(jsonResult.created_at)

    };
    return task;
};

function main() {
        
    queueSvc.getMessages('incomingstreamids', function (error, result, response) {
        if (!error) {
            // Message text is in messages[0].messageText
            var message = result[0];
            if (message != null) {
                var queryArray = message.messageText.split(';')
                
                tableSvc.retrieveEntity('incomingstreamcontents', queryArray[0], queryArray[1], function (error, result, response) {
                    if (!error) {
                    // query was successful
                    }
					
                    var task = convertJsonToTask(result.description._, result.PartitionKey._, result.RowKey._);
                    
                    tableSvc.replaceEntity('incomingstreamcontents', task, function (error, result, response) {
                        if (!error) {
                            // Entity updated
                            queueSvc.createQueueIfNotExists("processedstreamids", function (error, result, response) {
                                if (!error) {
                                    var queMessage = message.messageText + "|" + task.profileimage._;
                                    queueSvc.createMessage('processedstreamids', queMessage , function (error, result, response) {
                                        if (!error) {
            
                                        }
                                    });
                                }
                            });
                            
                            queueSvc.deleteMessage('incomingstreamids', message.messageId, message.popReceipt, function (error, response) {
                                if (!error) {
                                    main();
                                }
                            });
                        }
                    });
                });
            }
        }
    });
};

function starter()
{
    main();
    //while (true) {
    //    setTimeout(main, 10000);
    //}
};

starter();

