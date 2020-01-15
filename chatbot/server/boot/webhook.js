// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const axios = require('axios');
const accessToken = '6lB-0pFEANqV-V0BDS4aSn_xyWatsaOmM-B2DmcR4midtOidIficM1lt_tWilqiF0kMO1bUfA3uuvPuILwijQ1xHj7ntxX1HBgYWL0Bc37DrcAXGA-GAUMdOndiWuX41JBcJ0I66CNXQq9X63gujMaJ5YKCLX50qL-75CYoOPKaFm-TaOADGIKxZt5vYd5jxIgJhTZ7iS6fwi-1YCEPpT7MpytWNtKrLQRtlDX27L41jteHs5gT8JcVYqLGNkbf3DEM2R1UvEtfLXEfQDKuQ3-5ECzCkVW';
const requestURL = `https://openapi.zalo.me/v2.0/oa/message?access_token=${accessToken}`;
module.exports = function(server) {
  // Install a `/` route that returns server status
  const router = server.loopback.Router();
  router.get('/', (req, res) => res.send('Chatbot'));
  router.get('/webhook', (req, res) => res.send('Webhook'));
  router.post('/webhook', async (req, res) => {
    console.log(req.body);
    sendText(req.body.sender.id, "sent from webhook");
    res.sendStatus(200);
  });

  const sendText = async (id, message) => {
    console.log(id, message)
    console.log(requestURL)
    await axios.post(requestURL, {
      recipient: {
        user_id: id
      },
      message: {
        text: message
      }
    });
  };
  server.use(router);
};
