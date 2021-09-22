import { hexlify, keccak256 } from "ethers/lib/utils";
import * as RLP from "@ethersproject/rlp";

class BrokerData {
    public borkerName: string;
    public chainId: number;
    public receiver: string;
    public tokenId: number;
    // The user wants to receive 
    public tokenIdReceive: number;
    public amount: string;
    public withdrawFee: number;
    // L2 nonce ,not ethereum nonce
    public nonce_l2: number;

    public nonce: string;

    // The signer's address
    public signer: string;
    // The address for the actual pay of funds
    // accepter must first authorize signer.
    public accepter: string;

    //unique id as mongodb index
    public hashId: string;

    //L1 tx hash id
    public txId: string;

    // createTime is the db insert time
    public createTime: number;

    // signTime is the sign time,same as send time.
    public signTime: number;

    // when confirmTime > 0,
    // it means that the broker tx has been on chain.
    // default 0
    public confirmTime: number;

    constructor(
        _brokerName: string,
        _chainId: number,
        _receiver: string,
        _tokenId: number,
        _tokenIdReceive: number,
        _amount: string,
        _withdrawFee: number,
        _nonce_l2: number,
        _accepter: string
    ) {
        this.borkerName = _brokerName;
        this.chainId = _chainId;
        this.receiver = _receiver;
        this.tokenId = _tokenId;
        this.tokenIdReceive = _tokenIdReceive;
        this.amount = _amount;
        this.withdrawFee = _withdrawFee;
        this.nonce_l2 = _nonce_l2;
        this.accepter = _accepter;

        let arr = [];
        arr.push(hexlify(this.chainId));
        arr.push(this.receiver);
        arr.push(hexlify(this.tokenId));
        arr.push(hexlify(this.tokenIdReceive));
        arr.push(hexlify(this.amount, { allowMissingPrefix: true }));
        arr.push(hexlify(this.withdrawFee));
        arr.push(hexlify(this.nonce_l2));
        this.hashId = keccak256(RLP.encode(arr));

        this.createTime = Date.now();
        this.confirmTime = this.signTime = 0;
    }

}

export {
    BrokerData
}