import { providers, networkMap, tokenContractMap } from "./conf";
import { Contract, Wallet, utils } from "ethers"
import secret from "../conf/secret.json"
import contract_addrss from "../conf/contract_address.json"
import zkLink from "../build/zkLink.json"
import { getSigner } from "./signer";
import { insertBrokerData, updateConfirmTime, updateNonceAndTxId, findMany } from "./mongo";
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

async function accept(chainId: number, receiver: string, tokenId: number, amount: string, withdrawFee: number, nonce_l2: number) {
    let networkName: string = networkMap[chainId];
    if (!networkName) {
        loggerAccept.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
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
    //step1
    insertBrokerData([data]);
    /// TODO maybe we should check whether the balance of wallet is enough

    let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), wallet);
    // let tx = TransactionRequest
    let tx: TransactionRequest = {
        to: contract_addrss[networkName],
        from: wallet.address,
        // nonce: signerNonce,
        gasLimit: overrides.gasLimit,
        data: zkLinkContract.interface.encodeFunctionData("accept", [accepter, receiver, tokenId, utils.parseUnits(amount, "wei"), withdrawFee, nonce_l2]),
        value: 0,
        type: 0,
        // gasPrice: gasPrice
        // maxPriorityFeePerGas: overrides.gasPrice,
        // maxFeePerGas: overrides.gasPrice * 2
    };
    //step2 may loss the connection
    tx = await wallet.populateTransaction(tx);

    //step3
    let rawTx = await wallet.signTransaction(tx);
    let txId = keccak256(rawTx);
    data.nonce = tx.nonce.toString();
    data.txId = txId;
    //step4
    updateNonceAndTxId(data.hashId, data.nonce, data.txId, Date.now(), wallet.address);

    //step5
    let res = await wallet.provider.sendTransaction(rawTx);

    loggerBrokerSuccess.info(res);
}

//check process
// if exist txid ,check wheather tx on chain
// else re sign tx, use new prikey ... 
async function checkConfirm(chainId: number) {
    let networkName: string = networkMap[chainId];
    if (!networkName) {
        loggerAccept.error("Broker: Error, network name not exist. chainId: %d", chainId);
        return;
    }
    let provider = providers[networkName];

    // query chainId= && brokerName= && confirmTime == 0  
    let arr = await findMany(chainId, secret["broker-name"], 0);
    arr.forEach(async doc => {
        let data = doc as BrokerData;
        let receipt = await provider.getTransactionReceipt(data.txId);
        if (receipt && receipt.confirmations > 12) {
            updateConfirmTime(data.hashId, Date.now());
            return;
        }

        if (data.signTime == 0) {
            // TODO resign
            // It's almost impossible to happen.
            // If it happens, it must be because of the network

        }

        //TODO different chain different deadline
        if (Date.now() - data.signTime > 3 * 60 * 1000) {
            // resign
            // getSigner, populateTransactio, sign
            // updateNonceAndTxId
        }


    })
}

setInterval(async () => {
    await checkConfirm(0);//TODO
    await checkConfirm(1);//TODO
    await checkConfirm(2);//TODO
    await checkConfirm(3);//TODO
}, 30000);//10s
export {
    accept
}