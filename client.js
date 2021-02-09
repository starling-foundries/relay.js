const http = require('http')
const {BN, Long, bytes, units} = require('@zilliqa-js/util');
const {Zilliqa} = require('@zilliqa-js/zilliqa');
const {
    getAddressFromPrivateKey,
    getPubKeyFromPrivateKey,
    sign,
} = require('@zilliqa-js/crypto');

var hash = require('hash.js')

function main(){
    const zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
    const CHAIN_ID = 333;
    const MSG_VERSION = 1;
    const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
    zilliqa.wallet.create()
    const publickey = zilliqa.wallet.defaultAccount.publicKey
    const privkey = zilliqa.wallet.defaultAccount.privateKey
//Signature Parameters calculation
const message = "Billy"
const value = 15
const val = new BN(value)
const complicated = Uint8Array.from(val.toArrayLike(Buffer, undefined, 16))
const msg_hash = hash.sha256().update(message).digest('hex') 
console.log("msg_hash: ")
console.log(`0x` + `${msg_hash}`);
const val_hash = hash.sha256().update(complicated).digest('hex') 
console.log("val_hash: ")
console.log(`0x` + `${val_hash}`);
const msg_buf = Buffer.from(msg_hash + val_hash, 'hex')
const sig = sign(msg_buf,privkey,publickey)
console.log("pubkey: ")
console.log(`0x` + `${publickey}`);
console.log("privkey: ")
console.log(`0x` + `${privkey}`);
console.log("buf_message: ")
console.log(`${msg_buf}`);
console.log("sig: ")
console.log(`0x` + `${sig}`);

const data = JSON.stringify(
    {
        message: `${message}`,
        value: `${val}`,
        pubkey: `${publickey}`,
        signature: `${sig}`
    }
)
const options = {
    port: 3002,
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
}

const req = http.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
        process.stdout.write(d)
    })
})

req.on('error', error => {
    console.error(error)
})

req.write(data)
req.end()
}
main();