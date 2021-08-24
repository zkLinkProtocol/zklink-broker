// import Koa = require('koa2');
// const app = new Koa();

import {Contract, Wallet, utils} from "ethers"
import secret from "../secret.json"
import { providers } from "./conf";

import zkLink from "../build/zkLink.json"

var argv = require('minimist')(process.argv.slice(2),{'string':['to','accepter','receiver','amount'],'boolean':['swap']});

let provider = providers.matic_test;

let wallet = new Wallet(secret.prikey, provider);

const overrides = {
    // gasLimit: 9999999,
    // gasPrice: 50000000000 //gwei
}

async function accept(){
    console.log(argv);
    let {accepter, receiver, tokenId, amount, withdrawFee, nonce} = argv;
    let zkLinkContract = new Contract(secret.zkLinkContractAddress, JSON.stringify(zkLink.abi), provider);
    let tx = await zkLinkContract.connect(wallet).accept(accepter, receiver, tokenId, utils.parseUnits(amount, 1), withdrawFee, nonce, overrides);
    console.log(tx);
}

accept();


// // response
// app.use(ctx => {
//   ctx.body = 'Hello Koa';
// });
 
// app.use(async (ctx, next) => {
//     const start = new Date();
//     await next();
//     const ms = new Date() - start;
//     console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
// });

// app.listen(3000);


