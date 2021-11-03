import { providers, networkMap } from "./conf";
import { Contract, Wallet, utils } from "ethers"
import secret from "../conf/secret.json"
import contract_addrss from "../conf/contract_address.json"
import zkLink from "../build/zkLink.json"
import { getSigner } from "./signer";
import { insertBrokerData, updateConfirmTime, updateNonceAndTxId, findMany, findByHashId, updateNonceAndTxIdForce } from "./mongo";
import { TransactionRequest } from "@ethersproject/providers";
import AccepterContractAddress from "../conf/accepter_contract_address.json"
import { getLogger } from "./log4js";
import { BrokerData } from "./BrokerData";
import { keccak256 } from "ethers/lib/utils";
const loggerAccept = getLogger();// categorie: broker-accept
const loggerBrokerSuccess = getLogger("broker-success");

//accept func gasLimit
const overrides = {
    gasLimit: 200000, // about 11,000
    // gasPrice: 3000000000 //gwei
}

//step1 ,insert mongo db
//step2 ,populateTransaction {get nonce/gasprice/chainid...}
//step3 ,signTransaction, get rawtx and txid
//step3 ,update nonce/txid to mongodb
//step4 ,send rawTx, sendTransaction

/**
 * update@ 3 Nov 2021.
 * 1. accept func can be recall.
 * 2. the returned txid may change. 
 *      especially, populateTransaction wasinterrupted because of network timeout
 *      or
 *      the tx gasPrice is too low, wait time exceeds RESEND_PERIOD_TIME.
 * @param chainId 
 * @param receiver 
 * @param tokenId 
 * @param amount 
 * @param withdrawFee 
 * @param nonce_l2 
 * @returns txid
 */
async function accept(chainId: number, receiver: string, tokenId: number, amount: string, withdrawFee: number, nonce_l2: number) {
    let networkName: string = networkMap[chainId];
    if (!networkName) {
        throw "chainId not exist, chainId: " + chainId
    }

    let wallet = new Wallet(getSigner(chainId), providers[networkName]);
    let accepter = AccepterContractAddress[networkName];
    let tokenIdReceive = tokenId;
    let data = new BrokerData(
        secret["broker-name"],
        chainId,
        receiver,
        tokenId,
        tokenIdReceive,
        amount,
        withdrawFee,
        nonce_l2,
        accepter);
    try {
        await insertBrokerData([data]);
    } catch (err) {
        // find if it already exist 
        let doc = await findByHashId(data.hashId);
        let res = doc as BrokerData;
        if (res.txId) {
            return res.txId;
        } else {
            throw "insert occurs some error";
        }
    }
    let { rawTx: rawTx, txId: txId, nonce: nonce }
        = await sign(networkName, wallet, accepter, receiver, tokenId, amount, withdrawFee, nonce_l2);

    let result = await updateNonceAndTxId(data.hashId, nonce, txId, Date.now(), wallet.address);

    if (result) {
        setImmediate(async () => {
            let res = await wallet.provider.sendTransaction(rawTx);
            loggerBrokerSuccess.info(res);
        });
    } else {
        loggerAccept.error("updateNonceAndTxId already exist: hashId = ", data.hashId);
        throw "updateNonceAndTxId error"
    }

    return txId;
}

async function sign(networkName: string, wallet: Wallet, accepter: string, receiver: string, tokenId: number, amount: string, withdrawFee: number, nonce_l2: number) {
    let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), wallet);
    let tx: TransactionRequest = {
        to: contract_addrss[networkName],
        from: wallet.address,
        gasLimit: overrides.gasLimit,
        data: zkLinkContract.interface.encodeFunctionData("accept", [accepter, receiver, tokenId, utils.parseUnits(amount, "wei"), withdrawFee, nonce_l2]),
        value: 0,
        type: 0,
    };

    //step2 may loss the connection
    tx = await wallet.populateTransaction(tx);

    let rawTx = await wallet.signTransaction(tx);
    let txId = keccak256(rawTx);
    return { rawTx: rawTx, txId: txId, nonce: tx.nonce.toString() };
}

//check process
/*
0. hashid, insert
1. signTime & txid updated
3. confirmTime updated

action:
0 | 1 -> 3
0 -> 1 | 1 | ... | 1 -> 3
*/
const RESEND_PERIOD_TIME = 10 * 60 * 1000;// 5 * 60 * 1000  5min
const BLOCK_CONFIRM_NUMBER = 6;
async function checkConfirm(chainId: number) {
    let networkName: string = networkMap[chainId];
    if (!networkName) {
        loggerAccept.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }
    let provider = providers[networkName];
    let wallet = new Wallet(getSigner(chainId), providers[networkName]);
    // query chainId= && brokerName= && confirmTime == 0  
    let arr = await findMany(chainId, secret["broker-name"], 0);
    arr.forEach(async doc => {
        let data = doc as BrokerData;
        let updateFuncHandle = null;
        if (data.signTime == 0) {
            //resign and send tx
            updateFuncHandle = updateNonceAndTxId;// if sign is interrupted , where signTime == 0
        } else if (data.signTime != 0 && data.txId) {
            // check if tx onchain
            let receipt = await provider.getTransactionReceipt(data.txId);
            if (receipt) {
                if (receipt.confirmations > BLOCK_CONFIRM_NUMBER) {
                    updateConfirmTime(data.hashId, Date.now());
                }
            } else if (data.confirmTime == 0 && (Date.now() - data.signTime > RESEND_PERIOD_TIME)) {
                updateFuncHandle = updateNonceAndTxIdForce;// does not require signTime equal 0
            }
        }

        if (updateFuncHandle) {
            setImmediate(async () => {
                let { rawTx: rawTx, txId: txId, nonce: nonce } =
                    await sign(networkName, wallet, data.accepter, data.receiver,
                        data.tokenId, data.amount, data.withdrawFee, data.nonce_l2);
                let result = await updateFuncHandle(data.hashId, nonce, txId, Date.now(), wallet.address);
                if (result) {
                    let res = await wallet.provider.sendTransaction(rawTx);
                    loggerBrokerSuccess.info(res);
                } else {
                    loggerAccept.error("updateNonceAndTxId already exist: hashId = ", data.hashId);
                }
            });
        }
    });
}

setInterval(async () => {
    await checkConfirm(0);
    await checkConfirm(1);
    await checkConfirm(2);
    await checkConfirm(3);
}, 10000);//10s
export {
    accept
}