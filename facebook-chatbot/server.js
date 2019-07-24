/* jshint node: true, devel: true */
'use strict';

const 
  bodyParser = require('body-parser'),
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use(express.static('public'));

const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');
const SERVER_URL = (process.env.SERVER_URL) ?
  (process.env.SERVER_URL) :
  config.get('serverURL');
if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN && SERVER_URL)) {
  console.error("Missing config values");
  process.exit(1);
}

//chat mode
var mode='init';
//translate object
var googleTranslate = require('google-translate')('AIzaSyAKiW38sc4TZMOirm7c6FtcsBhZM6N1_2s');

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    //console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});
app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
       if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else if (messagingEvent.read) {
          receivedMessageRead(messagingEvent);
        } else if (messagingEvent.account_linking) {
          receivedAccountLink(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});
app.get('/authorize', function(req, res) {
  var accountLinkingToken = req.query.account_linking_token;
  var redirectURI = req.query.redirect_uri;

  // Authorization Code should be generated per user by the developer. This will 
  // be passed to the Account Linking callback.
  var authCode = "1234567890";

  // Redirect users to this URI on successful login
  var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

  res.render('authorize', {
    accountLinkingToken: accountLinkingToken,
    redirectURI: redirectURI,
    redirectURISuccess: redirectURISuccess
  });
});


function receivedMessage(event) {
  var senderID = event.sender.id;
//   if(currentSenderID!=senderID){
//       currentSenderID=senderID;
//       mode="init";
//   }
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  //console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
  //console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

  if (isEcho) {
    // Just logging message echoes to console
    //console.log("Received echo for message %s and app %d with metadata %s", messageId, appId, metadata);
    return;
  } else if (quickReply) {
    mode = quickReply.payload;
    //console.log("Quick reply for message %s with payload %s",messageId, quickReplyPayload);
    switch(mode){
        case 'Bot_Introduction_Payload':
            sendBotIntroduction(senderID);
            mode ="init";
            return;
        case 'RUNSYSTEM_PAYLOAD':
            sendRUNIntroduction(senderID);
            mode ="init";
            return;
        case 'Translation_Payload':
            sendTextMessage(senderID,"Enter the string that you want to translate.");
            sendTextMessage(senderID,"@Google Cloud Translation Engine");
            return;
        case 'Upload_Payload':
            sendTextMessage(senderID,"Let's upload something. You will get the link to what you uploaded.");
            return;
        case 'Show_Out_Payload':
            sendShowOutReply(senderID);
            return;
        default:
            sendQuickReply(senderID);
            mode="start";
            return;
    }
    // return;
  }

  if (messageText) {
    if(messageText=="exit"||mode=="init"){
        sendQuickReply(senderID);
        mode="start";
        return;
    }
    switch (mode) {
        case 'Bot_Introduction_Payload':
            sendBotIntroduction(senderID);
            mode="init";
            return;
        case 'Translation_Payload':
            sendTranslatedString(senderID,messageText);
            return;
        // case 'Upload_Payload':
        //     sendTextMessage(senderID,"Let's upload something. You will get the link to what you uploaded.");
        //     return;
        default:
            sendQuickReply(senderID);
            mode="start";
            return;
    }
  } else if (messageAttachments) {
    switch(mode){
        // case 'Bot_Introduction_Payload':
        //     sendBotIntroduction(senderID);
        //     return;
        // case 'Translation_Payload':
        //     sendTextMessage(senderID,"Enter the string that you want to translate.");
        //     return;
        case 'Upload_Payload':
            sendUploadRequest(senderID,messageAttachments);
            return;
        default:
            sendQuickReply(senderID);
            mode="start";
            return;
    }
  }
}
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  //console.log("Received authentication for user %d and page %d with pass " +"through param '%s' at %d", senderID, recipientID, passThroughParam, timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      //console.log("Received delivery confirmation for message ID: %s", messageID);
    });
  }

  //console.log("All message before %d were delivered.", watermark);
}
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

//   console.log("Received postback for user %d and page %d with payload '%s' " + "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  switch (payload) {
      case 'image':
        sendImageMessage(senderID);
        break;

      case 'gif':
        sendGifMessage(senderID);
        break;

      case 'audio':
        sendAudioMessage(senderID);
        break;

      case 'video':
        sendVideoMessage(senderID);
        break;

      case 'file':
        sendFileMessage(senderID);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      case 'quick reply':
        sendQuickReply(senderID);
        break;        

      case 'read receipt':
        sendReadReceipt(senderID);
        break;        

      case 'typing on':
        sendTypingOn(senderID);
        break;        

      case 'typing off':
        sendTypingOff(senderID);
        break;        

      case 'account linking':
        sendAccountLinking(senderID);
        break;
      default:
        sendTextMessage(senderID,"payload = " + payload);
    }
}
function receivedMessageRead(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  // All messages before watermark (a timestamp) or sequence have been seen.
  var watermark = event.read.watermark;
  var sequenceNumber = event.read.seq;

  //console.log("Received message read event for watermark %d and sequence " + "number %d", watermark, sequenceNumber);
}
function receivedAccountLink(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;

  var status = event.account_linking.status;
  var authCode = event.account_linking.authorization_code;

  //console.log("Received account link event with for user %d with status %s " + "and auth code %s ", senderID, status, authCode);
}

function sendBotIntroduction(recipientId){
   var messageData = {
   recipient:{
      id:recipientId
   },
   message:{
      attachment:{
         type:"template",
         payload:{
            template_type:"generic",
            elements:[
               {
                  title:"My Chatbot",
                  subtitle:"My Chatbot",
                  item_url: SERVER_URL,
                  image_url:SERVER_URL + "/assets/bot.png",
                  buttons:[
                     {
                        type:"web_url",
                        url:SERVER_URL,
                        title:"Introduction page"
                     }
                  ]
               }
            ]
         }
      }
   }
};  

  callSendAPI(messageData);
}
function sendRUNIntroduction(recipientId){
     var messageData ={
   recipient:{
      id:recipientId
   },
   message:{
      attachment:{
         type:"template",
         payload:{
            template_type:"generic",
            elements:[
               {
                  title:"GMO-Z.com RUNSYSTEM",
                  subtitle:"アプリのオフショア開発に信頼性と効率化を。iOS や Android を皮切りにウェブ業務ソフトウェア等の実績を持つ優秀なエンジニアがあなたをサポートします。",
                  item_url:"http://runsystem.net/home",
                  image_url:"http://runsystem.net/home/img/default/banner.png"
               }
            ]
         }
      }
   }
};  

  callSendAPI(messageData);
}
function sendTranslatedString(recipientId,messageText){
    googleTranslate.detectLanguage(messageText, function(err, detection) {
        // console.error(err);
        if(detection.language=='ja')
        return;
    }); 
    googleTranslate.translate(messageText, 'ja', function(err, translation) {
        // console.error(err);
        sendTextMessage(recipientId,'Japanese: ' + translation.translatedText);
    });
}
function sendUploadRequest(recipientId,messageAttachments){
    var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is uploaded link",
          buttons:[{
            type: "web_url",
            url: messageAttachments[0].payload.url,
            title: "Open link"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendShowOutReply(recipientId){
    var messageData = {
   recipient:{
      id:recipientId
   },
   message:{
      attachment:{
         type:"template",
         payload:{
            template_type:"button",
            text:"SHOW OUT:",
            buttons:[
               {
                  type: "postback",
                  title:"Image",
                  payload:"image"
               },
               {
                  type: "postback",
                  title:"Gif",
                  payload:"gif"
               },
               {
                  type: "postback",
                  title:"Audio",
                  payload:"audio"
               }
            ]
         }
      }
   }
};
  callSendAPI(messageData);
  sendShowOutReply2(recipientId);
}
function sendShowOutReply2(recipientId){
    var messageData = {
   recipient:{
      id:recipientId
   },
   message:{
      attachment:{
         type:"template",
         payload:{
            template_type:"button",
            text:"SHOW OUT:",
            buttons:[
               {
                  type: "postback",
                  title:"Video",
                  payload:"video"
               },
               {
                  type: "postback",
                  title:"File",
                  payload:"file"
               },
               {
                  type: "postback",
                  title:"Button",
                  payload:"button"
               }
            ]
         }
      }
   }
};
  callSendAPI(messageData);
  sendShowOutReply3(recipientId);
}
function sendShowOutReply3(recipientId){
    var messageData = {
   recipient:{
      id:recipientId
   },
   message:{
      attachment:{
         type:"template",
         payload:{
            template_type:"button",
            text:"SHOW OUT:",
            buttons:[
               {
                  type: "postback",
                  title:"Generic",
                  payload:"generic"
               },
               {
                  type: "postback",
                  title:"Receipt",
                  payload:"receipt"
               },
               {
                  type: "postback",
                  title:"Read receipt",
                  payload:"read receipt"
               }
            ]
         }
      }
   }
};
  callSendAPI(messageData);
   sendShowOutReply4(recipientId);
}
function sendShowOutReply4(recipientId){
    var messageData = {
   recipient:{
      id:recipientId
   },
   message:{
      attachment:{
         type:"template",
         payload:{
            template_type:"button",
            text:"SHOW OUT:",
            buttons:[
               {
                  type: "postback",
                  title:"Typing on",
                  payload:"typing on"
               },
               {
                  type: "postback",
                  title:"Typing off",
                  payload:"typing off"
               },
               {
                  type: "postback",
                  title:"Account linking",
                  payload:"account linking"
               }
            ]
         }
      }
   }
};
  callSendAPI(messageData);
}
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Trigger Postback",
            payload: "DEVELOPER_DEFINED_PAYLOAD"
          }, {
            type: "phone_number",
            title: "Call Phone Number",
            payload: "+16505551234"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: SERVER_URL + "/assets/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble"
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: SERVER_URL + "/assets/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble"
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}
function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What do you want?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"About Bot",
          "payload":"Bot_Introduction_Payload"
        },
        {
          "content_type":"text",
          "title":"GMO Z.COM RUNSYSTEM",
          "payload":"RUNSYSTEM_PAYLOAD"
        },
        {
          "content_type":"text",
          "title":"Translation",
          "payload":"Translation_Payload"
        },
        {
          "content_type":"text",
          "title":"Upload",
          "payload":"Upload_Payload"
        },
        {
          "content_type":"text",
          "title":"Show out",
          "payload":"Show_Out_Payload"
        }
      ]
    }
  };

  callSendAPI(messageData);
}
function sendReadReceipt(recipientId) {
  //console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}
function sendTypingOn(recipientId) {
  //console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}
function sendTypingOff(recipientId) {
  //console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons:[{
            type: "account_link",
            url: SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        //console.log("Successfully sent message with id %s to recipient %s", messageId, recipientId);
      } else {
      //console.log("Successfully called Send API for recipient %s", recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });  
}
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
  console.log(SERVER_URL);
});
module.exports = app;

