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
        let { chain_id, receiver, token_id, amount, withdrawFee, nonce } = ctx.request.body;
        receiver = hexlify(receiver, { allowMissingPrefix: true });
        loggerAccept.info(chain_id, receiver, token_id, amount, withdrawFee, nonce);

        try {
            let txId = await accept(Number(chain_id), receiver, Number(token_id), amount, Number(withdrawFee), Number(nonce));
            ctx.response.body = { result: true, errorMsg: "OK", data: { txId: txId } };
        } catch (err) {
            ctx.response.body = { result: true, errorMsg: JSON.stringify(err), data: {} };
            loggerAccept.error(err);
            // { result: true, errorMsg: "duplicate", data: {txId: txId}};
        }

    });

    app.use(router.routes());
    app.listen(secret["port"] || 3000);
}

main()
    .catch(err => {
        loggerAccept.error(err);
    })
