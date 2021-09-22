import { MongoClient } from 'mongodb';
import secret from "../secret.json"
import { BrokerData } from './BrokerData';
import { getLogger } from "./log4js";
const log = getLogger("mongo-log");
const client = new MongoClient(secret["mongo-uri"]);
//, { useNewUrlParser: true, useUnifiedTopology: true }Î
const dbName = secret["mongo-db-name"];
const colName = "document";

const FIFO = [];
createIndex();
async function handle() {
    await client.connect();
    const db = client.db(dbName);
    log.isDebugEnabled &&
        log.debug("Connected successfully to server");
    const collection = db.collection(colName);
    while (FIFO.length) {
        await FIFO.shift()(collection);
    }

}
setInterval(async () => {
    if (FIFO.length == 0) {
        return;
    }
    try {
        await handle();
    } catch (err) {
        log.error("mongodb error - ", err);
    } finally {
        log.isDebugEnabled &&
            log.debug("mongodb client close");
        client.close();
    }

}, 10000);//10s
function createIndex() {
    FIFO.push(async col => {
        let res = await col.createIndex({ 'hashId': 1 }, { unique: true });
        log.isDebugEnabled &&
            log.debug('mongodb createIndex => ', res);
    });
}

function insert(arr: Array<BrokerData>) {
    FIFO.push(async col => {
        let res = await col.insertMany(arr);
        log.isDebugEnabled &&
            log.debug('mongodb inserted docs => ', res);
    });
}
function updateNonceAndTxId(hashId: string, nonce: string, txId: string, signTime: number, signer: string) {
    FIFO.push(async col => {
        let res = await col.updateOne({ 'hashId': hashId },
            { '$set': { 'nonce': nonce, 'txId': txId, 'signTime': signTime ,'signer': signer} });
        log.isDebugEnabled &&
            log.debug('mongodb update', res);
    });
}
function updateConfirmTime(hashId: string, confirmTime: number) {
    FIFO.push(async col => {
        let res = await col.updateOne({ 'hashId': hashId },
            { '$set': { 'confirmTime': confirmTime } });
        log.isDebugEnabled &&
            log.debug('mongodb update', res);
    });
}
async function find(handle) {
    await client.connect();
    const db = client.db(dbName);
    log.isDebugEnabled &&
        log.debug("Connected successfully to server");
    const collection = db.collection(colName);
    return await handle(collection);
}
async function findMany(chainId: number, brokerName: string, confirmTime: number) {
    // broker-name/chainId/confirmTime
    let res = [];
    try {
        let cursor = await find(async col => {
            return await col.find({ 'borkerName': brokerName, 'chainId': chainId, 'confirmTime': confirmTime });
        });
        while (await cursor.hasNext()) {
            let doc = await cursor.next();
            res.push(doc);
        }
    } catch (err) {
        log.error("mongodb error: find - ", err);
    } finally {
        log.isDebugEnabled &&
            log.debug("mongodb client close");
        client.close();
    }
    return res;
}

export {
    insert as insertBrokerData,
    updateConfirmTime,
    updateNonceAndTxId,
    findMany
}