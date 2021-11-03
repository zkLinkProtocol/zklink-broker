import { hexlify, keccak256 } from "ethers/lib/utils";
import * as RLP from "@ethersproject/rlp";
enum AcceptTypeEnum {
    Accept,//0
    QuickSwapAccept//1
}
class BrokerData {
    public acceptType: AcceptTypeEnum;
    public borkerName: string;
    public chainId: number;
    public receiver: string;
    public tokenId: number;
    // The user wants to receive 
    public tokenIdReceive: number;
    public amount: string;
    public feeOrAmountOutMin: number | string;
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
        _acceptType: AcceptTypeEnum,
        _brokerName: string,
        _chainId: number,
        _receiver: string,
        _tokenId: number,
        _tokenIdReceive: number,
        _amount: string,
        _feeOrAmountOutMin: number | string,
        _nonce_l2: number,
        _accepter: string
    ) {
        this.acceptType = _acceptType;
        this.borkerName = _brokerName;
        this.chainId = _chainId;
        this.receiver = _receiver;
        this.tokenId = _tokenId;
        this.tokenIdReceive = _tokenIdReceive;
        this.amount = _amount;
        this.feeOrAmountOutMin = _feeOrAmountOutMin;
        this.nonce_l2 = _nonce_l2;
        this.accepter = _accepter;

        let arr = [];
        arr.push(hexlify(this.acceptType));
        arr.push(hexlify(this.chainId));
        arr.push(this.receiver);
        arr.push(hexlify(this.tokenId));
        arr.push(hexlify(this.tokenIdReceive));
        arr.push(hexlify(this.amount, { allowMissingPrefix: true, hexPad: "left" }));
        arr.push(hexlify(this.feeOrAmountOutMin, { allowMissingPrefix: true, hexPad: "left" }));
        arr.push(hexlify(this.nonce_l2));
        this.hashId = keccak256(RLP.encode(arr));

        this.createTime = Date.now();
        this.confirmTime = this.signTime = 0;
    }

}

export {
    BrokerData, AcceptTypeEnum
}