import { MongoClient } from 'mongodb';
import secret from "../conf/secret.json"
import { BrokerData } from './BrokerData';
import { getLogger } from "./log4js";
const log = getLogger("mongo-log");
const client = new MongoClient(secret["mongo-uri"]);
//, { useNewUrlParser: true, useUnifiedTopology: true }Î
const dbName = secret["mongo-db-name"];
const colName = "document";
let removeTimeoutHandle = null;
let collectionHandle = null;
createIndex();

async function push(cb) {
    await cb(await getCollection());
}

async function getCollection() {
    if (!collectionHandle) {
        await client.connect();
        log.isDebugEnabled &&
            log.debug("Connected successfully to server");
        const db = client.db(dbName);
        collectionHandle = db.collection(colName);
    }
    removeTimeoutHandle &&
        clearTimeout(removeTimeoutHandle);
    removeTimeoutHandle = setTimeout(async function () {
        log.isDebugEnabled &&
            log.debug("mongodb client close");
        await client.close();
        collectionHandle = 0;
    }, 60000);//60s
    return collectionHandle;
}

function createIndex() {
    push(async col => {
        let res = await col.createIndex({ 'hashId': 1 }, { unique: true });
        log.isDebugEnabled &&
            log.debug('mongodb createIndex => ', res);

    });
}

async function insert(arr: Array<BrokerData>) {
    return new Promise((resolve, reject) => {
        push(async col => {
            try {
                let res = await col.insertMany(arr);
                if (res.insertedCount == 1) {
                    resolve({});
                }
                log.isDebugEnabled &&
                    log.debug('mongodb inserted docs => ', res);
            } catch (err) {
                reject(err);
                if (err.code == 11000) {
                    //hashId_1 dup key
                    log.error("mongodb inserted error =>", 'duplicate');
                } else {
                    log.error('mongodb inserted error => ', err);
                }
            }
        });
    });
}
async function findByHashId(hashId: string) {
    return new Promise((resolve, reject) => {
        push(async col => {
            try {
                let cursor = await col.find({ 'hashId': hashId });
                if (await cursor.hasNext()) {
                    resolve(await cursor.next());
                }
            } catch (err) {
                reject(err);
            }
        });
    });
}
async function updateNonceAndTxIdForce(hashId: string, nonce: string, txId: string, signTime: number, signer: string) {
    return _updateNonceAndTxId(hashId, nonce, txId, signTime, signer, { 'hashId': hashId })
}
async function updateNonceAndTxId(hashId: string, nonce: string, txId: string, signTime: number, signer: string) {
    return _updateNonceAndTxId(hashId, nonce, txId, signTime, signer, { 'hashId': hashId, signTime: { '$eq': 0 } })
}
async function _updateNonceAndTxId(hashId: string, nonce: string, txId: string, signTime: number, signer: string, coindition: object) {
    return new Promise((resolve, reject) => {
        push(async col => {
            try {
                let res = await col.updateOne(coindition,
                    { '$set': { 'nonce': nonce, 'txId': txId, 'signTime': signTime, 'signer': signer } });
                resolve(res.modifiedCount == 1);
                log.isDebugEnabled &&
                    log.debug('mongodb update', res);
            } catch (err) {
                reject(err);
                log.error('mongodb update error', err);
            }
        });
    });
}
function updateConfirmTime(hashId: string, confirmTime: number) {
    push(async col => {
        let res = await col.updateOne({ 'hashId': hashId },
            { '$set': { 'confirmTime': confirmTime } });
        log.isDebugEnabled &&
            log.debug('mongodb update confirm time', res);
    });
}

async function findMany(chainId: number, brokerName: string, confirmTime: number): Promise<any[]> {
    return new Promise((resolve, _) => {
        push(async col => {
            let cursor = await col.find({ 'borkerName': brokerName, 'chainId': chainId, 'confirmTime': confirmTime });
            let res = [];
            while (await cursor.hasNext()) {
                let doc = await cursor.next();
                res.push(doc);
            }
            resolve(res);
        });
    });
}

export {
    insert as insertBrokerData,
    updateConfirmTime,
    updateNonceAndTxId,
    updateNonceAndTxIdForce,
    findMany,
    findByHashId
}