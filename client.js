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
    // const sender_zilliqa = new Zilliqa('https://dev-api.zilliqa.com');
    const CHAIN_ID = 333;
    const MSG_VERSION = 1;
    const VERSION = bytes.pack(CHAIN_ID, MSG_VERSION);
    privkey = '3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8';
    zilliqa.wallet.addByPrivateKey(
        privkey
    );
    const alice = getAddressFromPrivateKey(privkey); //alice is the sender
    const bob = "114f77519e8a463d25fc1a399870ed0dcb275ce3"  //bob recieves the metatransaction
    console.log("bob: ")
    console.log(`${bob}`);

    const pubkey = getPubKeyFromPrivateKey(privkey);
    const myGasPrice = units.toQa('2000', units.Units.Li); // Gas Price that will be used by all transactions

    //Signature Parameters calculation
    const amount = 12;
    const nonce = 14;
    const fee = 3;
    const contractAddr = "0b1384bf248f493226fdd1981b9ea56d6c94424d";

    const amount_bn = new BN(amount)
    const nonce_bn = new BN(nonce)
    const fee_bn = new BN(fee)
    const uint_amt = Uint8Array.from(amount_bn.toArrayLike(Buffer, undefined, 16))
    const uint_nonce = Uint8Array.from(nonce_bn.toArrayLike(Buffer, undefined, 16))
    const uint_fee = Uint8Array.from(fee_bn.toArrayLike(Buffer, undefined, 16))

    const to_hash = hash.sha256().update(bytes.hexToByteArray(bob)).digest('hex')
    console.log("to_hash: ")
    console.log(`${to_hash}`);

    const amount_hash = hash.sha256().update(uint_amt).digest('hex')
    console.log("amount_hash: ")
    console.log(`${amount_hash}`);

    const contract_hash = hash.sha256().update(bytes.hexToByteArray(contractAddr)).digest('hex')
    console.log("contract_hash: ")
    console.log(`${contract_hash}`);

    const fee_hash = hash.sha256().update(uint_fee).digest('hex')
    console.log("fee_hash: ")
    console.log(`${fee_hash}`);

    const nonce_hash = hash.sha256().update(uint_nonce).digest('hex')
    console.log("nonce_hash: ")
    console.log(`${nonce_hash}`);

    const msg_buf = Buffer.from(to_hash + amount_hash + contract_hash + fee_hash + nonce_hash, 'hex')
    const sig = sign(msg_buf, privkey, pubkey)
const data = JSON.stringify(
    {
        pubkey: `${pubkey}`,
        from: `${alice}`,
        to: `${bob}`,
        amount: `${amount}`,
        fee: `${fee}`,
        nonce: `${nonce}`,
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