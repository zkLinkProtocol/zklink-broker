let Accounts = require('web3-eth-accounts');
import path from 'path';
import fs from 'fs';
import { providers, networkMap } from "../conf";
import zkLink from "../zkLink.json"
// import MockErc20 from '../MockErc20.json'
import secret from "../../secret.json"

import contract_addrss from "../../contract_address.json"

import { Contract, Wallet, utils, BigNumber } from "ethers"
import { formatEther, parseEther } from '@ethersproject/units';
import { TransactionRequest } from '@ethersproject/providers';
// -c : keys count
// -p : keys path
// -t : type : {create, list , approve, transfer}
var argv = require('minimist')(process.argv.slice(2), { 'string': ['p', 't', 'amount', 'min_amount'] });

let count = argv['c'] || 10;
let keysPath = argv["p"] || process.cwd();
let type = argv["t"];
let chainId = argv["cid"] || 0;//defalt matic testnet
let tokenId = argv["tid"] || 1;// 
let minAmount = argv["min_amount"] || "0";
let amount = argv["amount"] || "0";
async function main() {

    switch (type) {
        case "create": create(); break;
        case "list": await list(); break;
        case "approve": await brokerApprove(); break;
        case "transfer": await transferBatch(); break;
        default: {
            console.log("\nprivate key manage tool")
            console.log("-t : create|list|approve|transfer");
            console.log("-c : create keys count");
            console.log("-p : create&list keys path");
            console.log("--cid : chain id");
            console.log("--tid : token id");
            console.log("--min_amont :  transfer filter amount")
            console.log("--amont :  transfer amount")
        }
    }

}
// return array format
// -p --cid --tid
async function list() {
    let filenames = fs.readdirSync(path.normalize(keysPath));
    filenames = filenames
        .filter(f => f.endsWith('.key'))
        .filter(f => f.startsWith('.key'));

    let accepter = secret['accepter-addr'];
    let networkName: string = networkMap[chainId];
    if (!networkName) {
        console.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }
    let truple = filenames.map(async (v, _) => {
        let key = fs.readFileSync(path.join(keysPath, v));

        let wallet = new Wallet(key.toString(), providers[networkName]);
        let balance = await wallet.getBalance();

        let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), wallet);
        let allowanceAmount = await zkLinkContract.brokerAllowance(tokenId, accepter, wallet.address);

        return [wallet.address, formatEther(balance), formatEther(allowanceAmount)]
    })
    console.log("Accepter: ", accepter);
    console.log(["Signer Addr", "Gas Coin Balance", "Broker Allowance"])
    while (truple.length) {
        console.log(await truple.pop())
    }
}
// -p -c 
function create() {
    let account = new Accounts();
    for (let i = 0; i < count; i++) {
        let obj = account.create();
        console.log(i, "\t", obj.address);

        let filename = path.join(keysPath, [".key-", obj.address, ".key"].join(""));
        console.log("write: ", filename);
        fs.writeFileSync(filename, obj.privateKey);
    }
}
// -p --cid --min_amount --amount
async function transferBatch() {
    let filenames = fs.readdirSync(path.normalize(keysPath));
    filenames = filenames
        .filter(f => f.endsWith('.key'))
        .filter(f => f.startsWith('.key'));

    let networkName: string = networkMap[chainId];
    if (!networkName) {
        console.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }

    let accepter = new Wallet(secret['accepter-key'], providers[networkName]);
    let nonce = await accepter.getTransactionCount();//latest
    let gasPrice = await accepter.getGasPrice();
    let truple = filenames.map(async (v, _) => {
        let key = fs.readFileSync(path.join(keysPath, v));

        let spender = new Wallet(key.toString(), providers[networkName]);
        let spender_bal = await spender.getBalance();
        if (spender_bal.gt(parseEther(minAmount))) {
            return "$skip    \t" + spender.address + "\t" + formatEther(spender_bal);
        }
        let sendTx: TransactionRequest = {
            to: spender.address,
            from: accepter.address,
            nonce: nonce,
            gasLimit: 30000,
            data: "",
            value: parseEther(amount),
            type: 0,
            gasPrice: gasPrice
        };
        nonce = nonce + 1;
        let tx = await accepter.sendTransaction(sendTx)
        return "#transfer\t" + tx.to + "\t" + amount + "\t" + tx.hash;
    })
    while (truple.length) {
        console.log(await truple.pop())
    }
}
let start = argv['start'] || 0;
let end = argv['end'] || 0;
// -p --cid --tid --start --end
async function brokerApprove() {
    let filenames = fs.readdirSync(path.normalize(keysPath));
    filenames = filenames
        .filter(f => f.endsWith('.key'))
        .filter(f => f.startsWith('.key'));

    let networkName: string = networkMap[chainId];
    if (!networkName) {
        console.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }

    let accepter = new Wallet(secret['accepter-key'], providers[networkName]);
    let nonce = await accepter.getTransactionCount();//latest
    let gasPrice = await accepter.getGasPrice();

    if (end == 0) {
        end = filenames.length;
    }

    let truple = filenames.slice(start, end).map(async (v, _) => {
        let key = fs.readFileSync(path.join(keysPath, v));

        let spender = new Wallet(key.toString());
        let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), accepter);

        let sendTx: TransactionRequest = {
            to: zkLinkContract.address,
            from: accepter.address,
            nonce: nonce,
            gasLimit: 200000,
            data: zkLinkContract.interface.encodeFunctionData("brokerApprove", [tokenId, spender.address, BigNumber.from("0xffffffffffffffffffffffffffffffff")]),
            value: 0,
            type: 0,
            gasPrice: gasPrice
        };
        nonce = nonce + 1;
        let tx = await accepter.sendTransaction(sendTx);
        return "#broker approve\t" + tx.to + "\t" + tx.hash;;
    })
    while (truple.length) {
        console.log(await truple.pop())
    }
}

main()
    .catch(err => {
        console.error(err);
    })