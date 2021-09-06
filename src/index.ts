import Koa = require('koa');
import { Context } from 'koa'
 const Router = require('koa-router')
 const bodyParser = require('koa-bodyparser');
 const app = new Koa();
 const router = new Router();

import {Contract, Wallet, utils} from "ethers"
import secret from "../secret.json"
import { providers } from "./conf";

import zkLink from "../build/zkLink.json"

//var argv = require('minimist')(process.argv.slice(2),{'string':['to','accepter','receiver','amount'],'boolean':['swap']});

//let provider = providers.matic_test;

//let wallet = new Wallet(secret.prikey, provider);

const overrides = {
     gasLimit: 100000,
     gasPrice: 50000000000 //gwei
}

async function accept(chainId:number, receiver:string, tokenId:number, amount:string, withdrawFee:number){
    var provider;
    var zkLinkContractAddress = "";
    switch(chainId){
        case 0: {
	    provider = providers.matic_test;
            zkLinkContractAddress = "0xF7DC712B104469f8fb9f12f042D63BD73919F1a9";
	    break;
	}
	case 1:{
	    provider = providers.rinkeby;
	    zkLinkContractAddress = "";
	    break;
	}
	case 2:{
	    provider = providers.heco_test;
	    zkLinkContractAddress = "0xC255afF2Ea6B872b26C88823E4eF0e3747F70CF3";
	    break;
	}
	case 3:{
            zkLinkContractAddress = "0x7b581053b8A7C22346c8081285b48BBD4aA13BAC";
            provider = providers.goerli;
	    break;
	}
	default:{
	    break;
	}
    }

    let wallet = new Wallet(secret.prikey, provider);
    let accepter = wallet.getAddress();
    let nonce = await wallet.getTransactionCount();
    let zkLinkContract = new Contract(zkLinkContractAddress, JSON.stringify(zkLink.abi), provider);
    let tx = await zkLinkContract.connect(wallet).accept(accepter, receiver, tokenId, utils.parseUnits(amount, 1), withdrawFee, nonce, overrides);
    console.log(tx);
}

//accept();

app.use(bodyParser())
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

router.post('/accept', async (ctx:Context) => {
  console.log(ctx);
  let chainId = ctx.request.body.chain_id;
  let receiver= ctx.request.body.receiver;
  let tokenId = ctx.request.body.token_id;
  let amount = ctx.request.body.amount;
  let withdrawFee = ctx.request.body.withdrawFee;

  console.log(chainId,receiver,tokenId,amount,withdrawFee);
  accept(chainId,receiver,tokenId,amount,withdrawFee);

  ctx.response.body = {result:true,errorMsg:"OK"};
});

app.use(router.routes());
 app.listen(3000);


