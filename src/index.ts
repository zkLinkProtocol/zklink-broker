import Koa = require('koa');
import { Context } from 'koa'
// const Router = require('koa-router')
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
// const bodyParser = require('koa-bodyparser');
const app = new Koa();
const router = new Router();

import { Contract, Wallet, utils } from "ethers"
import secret from "../secret.json"
import contract_addrss from "../contract_address.json"
import { providers, networkMap, tokenContractMap } from "./conf";
import BigNumber from "bignumber.js";
import zkLink from "./zkLink.json"
import { configure, getLogger } from "log4js";
configure("./log4js.conf.json");
const loggerAccept = getLogger();// categorie: broker-accept
const loggerBrokerSuccess = getLogger("broker-success");

//'string': ['to'], 'boolean': ['swap']
//-p  port defult 3000
const parseArgs = require('minimist')(process.argv.slice(2), {});

const overrides = {
  gasLimit: 200000,
  // gasPrice: 3000000000 //gwei
}

async function accept(chainId: number, receiver: string, tokenId: number, amount: string, withdrawFee: number, nonce: number) {
  let networkName: string = networkMap[chainId];
  if (!networkName) {
    loggerAccept.error("Broker: Error, network name not exist. chainId: %d", chainId);
    return;
  }

  let wallet = new Wallet(secret.prikey, providers[networkName]);
  let accepter = wallet.getAddress();
  let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), wallet);
  let tx = await zkLinkContract.connect(wallet).accept(accepter, receiver, tokenId, utils.parseUnits(amount, "wei"), withdrawFee, nonce, overrides);
  loggerBrokerSuccess.info(tx);
}

//tokenAddresses search tokenid => witch tokenaddress
async function tokenAddress(chainId: number, tokenId: number) {
  let networkName: string = networkMap[chainId];
  if (!networkName) {
    loggerAccept.error("Broker: Error, network name not exist. chainId: %d", chainId);
    return;
  }

  let wallet = new Wallet(secret.prikey, providers[networkName]);
  let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), wallet);
  let tx = await zkLinkContract.tokenAddresses();//TODO 
  loggerBrokerSuccess.info(tx);
  return tx;
}

//TODO should not be here
async function balance(chainId: number, token: string, address: string) {
  let networkName: string = networkMap[chainId];
  if (!networkName) {
    loggerAccept.error("Broker: Error, network name not exist. chainId: %d", chainId);
    return -1;
  }
  let tokenContractAddr = tokenContractMap.get(token);
  if (!tokenContractAddr) {
    loggerAccept.error("Broker: Error, token contract addr not exist. token name: %s", token);
    return -1;
  }
  let wallet = new Wallet(secret.prikey, providers[networkName]);
  let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), wallet);
  let balance = await zkLinkContract.getPendingBalance(address, tokenContractAddr);
  return new BigNumber(`${balance}`).toString();//TODO balance.toString();
}

app.use(bodyParser())
router.post('/accept', async (ctx: Context) => {
  let { chain_id, receiver, token_id, amount, withdrawFee, nonce } = ctx.request.body;
  loggerAccept.info(chain_id, receiver, token_id, amount, withdrawFee, nonce);
  await accept(chain_id, receiver, token_id, amount, withdrawFee, nonce);

  ctx.response.body = { result: true, errorMsg: "OK" };
});
router.get('/token_address', async (ctx: Context) => {
  let { chain_id, token_id } = ctx.query;
  loggerAccept.debug(chain_id, token_id);
  let token_address = await tokenAddress(Number(chain_id), Number(token_id));
  ctx.response.body = {
    status: 0,
    result: token_address,
    error_msg: ""
  }
})
router.get('/balance', async (ctx: Context) => {
  // let chainId = Number(ctx.query.chain as string);
  let { chain, token, address } = ctx.query;
  let bal = await balance(Number(chain), token as string, address as string);
  loggerAccept.debug("balance: ", bal);
  if (bal < 0) {
    //TODO should be the Jsonrpc fmt
    ctx.response.body = {
      status: 1, result: {
        balance: bal
      }, error_msg: "params error"
    };
    return;
  }

  ctx.response.body = {
    status: 0, result: {
      balance: bal
    }, error_msg: ""
  };
});


app.use(router.routes());
app.listen(parseArgs["p"] || 3000);


