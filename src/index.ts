import Koa = require('koa');
import { Context } from 'koa'
 const Router = require('koa-router')
 const bodyParser = require('koa-bodyparser');
 const app = new Koa();
 const router = new Router();

import {Contract, Wallet, utils} from "ethers"
import secret from "../secret.json"
import contract_addrss from "../contract_address.json"
import { providers, networkMapping } from "./conf";

import zkLink from "../build/zkLink.json"

//var argv = require('minimist')(process.argv.slice(2),{'string':['to','accepter','receiver','amount'],'boolean':['swap']});

const overrides = {
     gasLimit: 100000,
     gasPrice: 50000000000 //gwei
}

async function accept(chainId:number, receiver:string, tokenId:number, amount:string, withdrawFee:number){
    let provider;
    let zkLinkContractAddress = "";
    let networkName: string = networkMapping[chainId];
    if(!networkName) {
        console.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }

    let wallet = new Wallet(secret.prikey, providers[networkName]);
    let accepter = wallet.getAddress();
    let nonce = await wallet.getTransactionCount();
    let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), provider);
    let tx = await zkLinkContract.connect(wallet).accept(accepter, receiver, tokenId, utils.parseUnits(amount, "wei"), withdrawFee, nonce, overrides);
    console.log(tx);
}

app.use(bodyParser())

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


