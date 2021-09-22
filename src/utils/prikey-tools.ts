let Accounts = require('web3-eth-accounts');
import path from 'path';
import fs from 'fs';
import { providers, networkMap, tokenContractMap } from "../conf";
import zkLink from "../zkLink.json"
// import MockErc20 from '../MockErc20.json'
import secret from "../../secret.json"

import contract_addrss from "../../contract_address.json"

import { Contract, Wallet, utils } from "ethers"
import { formatEther } from '@ethersproject/units';
// -c : keys count
// -p : keys path
// -t : type : {create, list , approve}
var argv = require('minimist')(process.argv.slice(2), { 'string': ['p', 't'] });

let count = argv['c'] || 10;
let keysPath = argv["p"] || process.cwd();
let type = argv["t"];
let chainId = argv["cid"] || 0;//defalt matic testnet
let tokenId = argv["tid"] || 1;// 
async function main() {

    switch (type) {
        case "create": create(); break;
        case "list": await list(); break;
        case "approve": await brokerApprove(); break;
        default: {
            console.log("\nprivate key manage tool")
            console.log("-t : create|list|approve");
            console.log("-c : create keys count");
            console.log("-p : create&list keys path");
            console.log("--cid : chain id");
            console.log("--tid : token id");
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
        let allowanceAmount = 0;//await zkLinkContract.brokerAllowance(tokenId, accepter, wallet.address);

        return [wallet.address, formatEther(balance), allowanceAmount]
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
// -p --cid --tid
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

    let truple = filenames.map(async (v, _) => {
        let key = fs.readFileSync(path.join(keysPath, v));

        let accepter = new Wallet(secret['accepter-key'], providers[networkName]);
        let spender = new Wallet(key.toString());

        let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), accepter);
        let tx = await zkLinkContract.connect(accepter).brokerApprove(tokenId, spender.address, "0xffffffffffffffff", { gasLimit: 200000 });

        return tx;
    })
    while (truple.length) {
        console.log(await truple.pop())
    }
}

main()
    .catch(err => {
        console.error(err);
    })