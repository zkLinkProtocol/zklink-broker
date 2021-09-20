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
import BigNumber from "bignumber.js";
import zkLink from "../build/zkLink.json"

//var argv = require('minimist')(process.argv.slice(2),{'string':['to','accepter','receiver','amount'],'boolean':['swap']});

const overrides = {
     gasLimit: 1000000,
     gasPrice: 50000000000 //gwei
     }

let tokenAddrMap = new Map([
[ "QUICK","0xaac36c620e2f52aec3eeed2b89a2ea19babb132a"],
[ "KRILL","0x5122fa43c7d6da72ecf423f4955a0cc38753dab2"],
[ "MDX","0xe583769738b6dd4E7CAF8451050d1948BE717679"],
[ "COW","0x1A508809A119Eee6F4b7ADeef3f2a9b4479608Ac"],
[ "XVS","0xAAC36C620E2f52AeC3EeEd2b89A2eA19BAbB132A"],
[ "AUTO","0x5122fa43c7D6dA72Ecf423F4955A0cC38753dab2"],
[ "UNI","0x8Dc5CA19e64ade17aEEB4F8c52BF8ff220eD17dE"],
[ "SUSHI","0xFced6f29c8BE8C1A679fBc7Ebb0AC1D3298e775e"],
[ "SRM","0x80101F4da93A2912DC41b8eDBB30b98d428b8C43"],
[ "RAY","0xd42b3eebb2e86ef83f78eFB7d5432912D5F9259c"]
    ]); 


async function accept(chainId:number, receiver:string, tokenId:number, amount:string, withdrawFee:number,nonce:number){
    let provider;
    let zkLinkContractAddress = "";
    let networkName: string = networkMapping[chainId];
    if(!networkName) {
        console.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }

    let wallet = new Wallet(secret.prikey, providers[networkName]);
    let accepter = wallet.getAddress();
    let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), provider);
    let tx = await zkLinkContract.connect(wallet).accept(accepter, receiver, tokenId, utils.parseUnits(amount, "wei"), withdrawFee, nonce, overrides);
    console.log(tx);
}
async function balance(chainId:number,token:string) {
    let provider;
    let zkLinkContractAddress = "";
    let networkName: string = networkMapping[chainId];
    if(!networkName) {
        console.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }

    let wallet = new Wallet(secret.prikey, providers[networkName]);
    let accepter = wallet.getAddress();
    let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), provider);
    let tokenAddress = tokenAddrMap.get(token);
    let balance = await zkLinkContract.connect(wallet).getPendingBalance(accepter, tokenAddress);
    return new BigNumber(`${balance}`).toString();
}
app.use(bodyParser())

router.post('/accept', async (ctx:Context) => {
  console.log(ctx);
  let chainId = ctx.request.body.chain_id;
  let receiver= ctx.request.body.receiver;
  let tokenId = ctx.request.body.token_id;
  let amount = ctx.request.body.amount;
  let withdrawFee = ctx.request.body.withdrawFee;
  let nonce = ctx.request.body.nonce;
  console.log(new Date(Date.parse(new Date().toString())),chainId,receiver,tokenId,amount,withdrawFee,nonce);
  accept(chainId,receiver,tokenId,amount,withdrawFee,nonce);

  ctx.response.body = {result:true,errorMsg:"OK"};
  });
router.get('/balance',async(ctx:Context) => {
console.log(ctx.query.token);
    let chainId = Number(ctx.query.chain as string);
    let bal = await balance(chainId,ctx.query.token as string);
    console.log(bal);
    ctx.response.body = bal;    
  });

app.use(router.routes());
app.listen(3000);


