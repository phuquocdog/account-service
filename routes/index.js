var express = require('express');
var router = express.Router();
const { Keyring } = require('@polkadot/keyring');
const { mnemonicGenerate,cryptoWaitReady } = require('@polkadot/util-crypto');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    status: true,
    message: 'Account services on Phu Quoc Network'
  })
});

router.get('/ping', function(req, res, next) {
  res.json({
    status: true,
    message: 'Account services on Phu Quoc Network'
  })
});

router.post('/', function(req, res, next) {
  const keyring = new Keyring({ type: 'sr25519' });
  const phrase = mnemonicGenerate(12);
  const {address} = keyring.addFromUri(phrase);
  console.log('Your phrase: ' + phrase);
  console.log('Your address: ' + address);

  res.json({
    status: true,
    mnemonic: {
      phrase: phrase
    },
    address: address
  })
});

module.exports = router;
