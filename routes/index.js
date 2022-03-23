var express = require('express');
var router = express.Router();
const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate,cryptoWaitReady } = require('@polkadot/util-crypto');

const WebSocketClient = require('websocket').client;
// Import
const { ApiPromise, WsProvider } =  require('@polkadot/api');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    status: true,
    message: 'Account services on Phu Quoc Network'
  })
});

//Created an account

router.post('/', function(req, res, next) {
  const keyring = new Keyring({ type: 'sr25519' });
  const phrase = mnemonicGenerate(12);
  const {address} = keyring.addFromUri(phrase);
  console.log('Your address: ' + address);

  res.json({
    status: true,
    mnemonic: {
      phrase: phrase
    },
    address: address
  })
});

// Get a address wallet via pharse
router.post('/phrase', function(req, res, next) {
  const keyring = new Keyring({ type: 'sr25519' });
  const {address} = keyring.addFromUri(req.body.phrase);

  res.json({
    status: true,
    address: address
  })
});

async function ping() {

  const wsProvider = new WsProvider('wss://rpc.phuquoc.dog');
  return await ApiPromise.create({ provider: wsProvider });

  console.log('aaa', a);
}
async function main () {
  // Initialise the provider to connect to the local node
  const provider = new WsProvider('ws://127.0.0.1:9944');

  // Create the API and wait until ready
  const api = await ApiPromise.create({ provider });

  // Retrieve the chain & node information information via rpc calls
  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version()
  ]);

  console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
}

router.get('/ping', function(req, res, next) {  

 let client = new WebSocketClient();

  client.on('connectFailed', function(error) {
    res.status(500).json({
      status: false,
      message: error.toString()
    })
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      res.status(500).json({
        status: false,
        message: 'echo-protocol Connection Closed'
      })
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    connection.close();
    
    res.status(200).json({
      status: true,
      message: 'OK'
    })

  });

  client.connect('wss://rpc.phuquoc.dog', 'echo-protocol');

});

module.exports = router;
