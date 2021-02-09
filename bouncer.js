// Simple endpoint that takes the JSON recieved from a client containing the message and forwards it with the _owner wallet to the smart contract

const {BN, Long, bytes, units} = require('@zilliqa-js/util');
const {Zilliqa} = require('@zilliqa-js/zilliqa');
const {
    getAddressFromPrivateKey,
    getPubKeyFromPrivateKey,
    sign,
} = require('@zilliqa-js/crypto');
const express = require('express');
const bodyParser = require('body-parser');

async function bounce(message, value, pubkey, signature) {
    const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
    const CHAIN_ID = 333;
    const MSG_VERSION = 1;
    const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
    privkey = '3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8';
    zilliqa.wallet.addByPrivateKey(
        privkey
    );
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions

    const contractAddr = "zil1fez4c739auzkfp9argf4nn0j677frykkejjg89";
    try {
        const contract = zilliqa.contracts.at(contractAddr);
        const callTx = await contract.call(
            'setHello',
            [
                {
                    vname: 'msg',
                    type: 'String',
                    value: `${message}`,
                },{
                    vname: 'value',
                    type: 'Uint128',
                    value: `${value}`,
                },
                {
                    vname: 'signer',
                    type: 'ByStr33',
                    value: `0x` + `${pubkey}`,
                },
                {
                    vname: 'signature',
                    type: 'ByStr64',
                    value: `0x` + `${signature}`,
                },
            ],
            {
                // amount, gasPrice and gasLimit must be explicitly provided
                version: VERSION,
                amount: new BN(0),
                gasPrice: myGasPrice,
                gasLimit: Long.fromNumber(10000),
            }
        );
        console.log(JSON.stringify(callTx.receipt, null, 4));

    } catch (err) {
        console.log(err);
    }
}
function main(){
    //spin up the express server
    const app = express()
    const port = 3002
    app.use(bodyParser.json())
    app.use(express.static("public"));
    app.post('/', (req,res) =>{
        console.log('Got message:', req.body);
        bounce(req.body.message, req.body.value, req.body.pubkey, req.body.signature )
        res.sendStatus(200);
    })
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
      })
    //connect the bouncer function
}
main();
