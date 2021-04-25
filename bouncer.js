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

async function bounce(pubkey, from, to, amount, fee, nonce, signature) {
    const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
    const CHAIN_ID = 333;
    const MSG_VERSION = 1;
    const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
    privkey = '07e0b1d1870a0ba1b60311323cb9c198d6f6193b2219381c189afab3f5ac41a9';
    zilliqa.wallet.addByPrivateKey(
        privkey
    );
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions

    const contractAddr = "0b1384bf248f493226fdd1981b9ea56d6c94424d";
    try {
        const contract = zilliqa.contracts.at(contractAddr);
        const callTx = await contract.call(
            'ChequeSend',
            [
                {
                    vname: 'pubkey',
                    type: 'ByStr33',
                    value: `0x` + `${pubkey}`,
                },
                {
                    vname: 'from',
                    type: 'ByStr20',
                    value: `${from}`,
                },
                {
                    vname: 'to',
                    type: 'ByStr20',
                    value: `0x` + `${to}`,
                },
                {
                    vname: 'amount',
                    type: 'Uint128',
                    value: `${amount}`,
                },
                {
                    vname: 'fee',
                    type: 'Uint128',
                    value: `${fee}`,
                },
                {
                    vname: 'nonce',
                    type: 'Uint128',
                    value: `${nonce}`,
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
    const host = '0.0.0.0';
    app.use(bodyParser.json())
    app.use(express.static("public"));
    app.post('/', (req,res) =>{
        console.log('Got message:', req.body);
        bounce(req.body.pubkey, req.body.from, req.body.to, req.body.amount, req.body.fee, req.body.nonce, req.body.signature )
        res.sendStatus(200);
    })
    app.listen(port, host)
    //connect the bouncer function
}
main();
