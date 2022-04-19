const Koa = require('koa');
import { Context } from 'koa'
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
const app = new Koa();
const router = new Router();
import secret from "../conf/secret.json"
import { getLogger } from "./log4js";
const loggerAccept = getLogger();// categorie: broker-accept
import { accept } from './broker';
import { initSigner } from './signer'
import { hexlify } from 'ethers/lib/utils';
import { AcceptTypeEnum } from './BrokerData';

async function main() {
    let signerCount = await initSigner();
    loggerAccept.info("initSigner: ", signerCount);
    signerCount.forEach((v, _) => {
        if (v == 0) {
            console.error("signer count == 0, process exit!!!");
            process.exit();
        }
    });

    app.use(bodyParser())
    router.post('/accept', async (ctx: Context) => {
        let { chain_id, receiver, account_id, token_id, amount, withdrawFee, nonce } = ctx.request.body;
        receiver = hexlify(receiver, { allowMissingPrefix: true });
        loggerAccept.info(chain_id, receiver,accountId, token_id, amount, withdrawFee, nonce);

        try {
            let real_chain_id = Number(chain_id) - 1;
            if (real_chain_id < 0) {
                throw Error("wrong chainId");
            }
            let txId = await accept(AcceptTypeEnum.Accept, real_chain_id, receiver, Number(account_id), Number(token_id), amount, Number(token_id), Number(withdrawFee), Number(nonce));
            ctx.response.body = { result: true, errorMsg: "OK", data: { txId: txId } };
        } catch (err) {
            ctx.response.body = { result: false, errorMsg: JSON.stringify(err), data: {} };
            loggerAccept.error(err);
        }

    });

    router.post('/accept_quick_swap', async (ctx: Context) => {
    /*let { chain_id, receiver, token_id, amount, acceptTokenId, acceptAmountOutMin, nonce } = ctx.request.body;
        receiver = hexlify(receiver, { allowMissingPrefix: true });
        loggerAccept.info(chain_id, receiver, token_id, amount, acceptTokenId, acceptAmountOutMin, nonce);

        try {
            let real_chain_id = Number(chain_id) - 1;
            if (real_chain_id < 0) {
                throw Error("wrong chainId");
            }
            let txId = await accept(AcceptTypeEnum.QuickSwapAccept, real_chain_id, receiver, Number(token_id), amount, Number(acceptTokenId), acceptAmountOutMin, Number(nonce));
            ctx.response.body = { result: true, errorMsg: "OK", data: { txId: txId } };
        } catch (err) {
            ctx.response.body = { result: false, errorMsg: JSON.stringify(err), data: {} };
            loggerAccept.error(err);
	}*/

    });

    app.use(router.routes());
    app.listen(secret["port"] || 3000);
}

main()
    .catch(err => {
        loggerAccept.error(err);
    })
