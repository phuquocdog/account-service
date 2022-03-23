var express = require('express');
var router = express.Router();
const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate,cryptoWaitReady } = require('@polkadot/util-crypto');
const BN = require('bn.js');
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
// Get a address wallet via pharse
router.post('/transaction', async function(req, res, next) {
  let amount  = req.body.amount;
  let address = req.body.address;
  let phrase  = req.body.phrase;
  try {
      const api = await connection();

      // Constuct the keyring after the API (crypto has an async init)
      const keyring = new Keyring({ type: 'sr25519' });
      // Add myAccount to our keyring with a hard-deived path (empty phrase, so uses dev)
      const myAccount = keyring.addFromUri(phrase);

      const decims = new BN(api.registry.chainDecimals);
      const factor = new BN(10).pow(decims);
      const amountUnit = new BN(amount).mul(factor);

      const transfer = api.tx.balances.transfer(address, amountUnit);
      // Sign and send the transaction using our account
      const hash = await transfer.signAndSend(myAccount, { nonce: -1 });

      console.log('Transfer sent with hash', hash.toHex())
      res.json({
        status: true,
        hash: hash.toHex()
      })

    } catch (e) {
      
      res.json({
        status: false,
        message: e.message
      })

    }
});
async function connection() {

  const provider = new WsProvider('wss://rpc.phuquoc.dog');
  return await ApiPromise.create({provider});

}
async function ping() {

  const wsProvider = new WsProvider('wss://rpc.phuquoc.dog');
  return await ApiPromise.create({ provider: wsProvider });

  console.log('aaa', a);
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
