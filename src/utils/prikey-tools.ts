let Accounts = require('web3-eth-accounts');
import path from 'path';
import fs from 'fs';
import { providers } from "../conf";
import zkLink from "../../build/zkLink.json"
import Governance from "../../build/Governance.json"
import MockErc20 from "../../build/MockErc20.json"
import GovernanceAddress from "../../conf/governance_address.json"
import BrokerAccepter from "../../build/BrokerAccepter.json"
import secret from "../../conf/secret.json"
import AccepterContractAddress from '../../conf/accepter_contract_address.json'
import { deployContract } from "ethereum-waffle"
import contract_addrss from "../../conf/contract_address.json"
import { Contract, Wallet, BigNumber } from "ethers"
import { formatEther, parseEther } from '@ethersproject/units';
import { Command, Option } from 'commander';
import isNumber from 'is-number'
import AsciiTable from 'ascii-table'

const program = new Command();
program.version('0.0.1');
let myParseInt = (val) => {
    if (isNumber(val)) {
        return parseInt(val)
    }
    throw Error("param is not number");
}
let networkNameOption = new Option('-c, --network-name <networkName>', 'Network Name').choices(['matic_test', 'heco_test', 'rinkeby', 'goerli']);
let tokenIdOption = new Option('-t, --token-id <tokenId>', 'Token ID');
tokenIdOption.argParser(myParseInt);
let keysPathOption = new Option('-p, --keys-path <keysPath>', 'Keys Path');

let filenamesParse = keysPath =>
    fs.readdirSync(path.normalize(keysPath))
        .filter(f => f.endsWith('.key'))
        .filter(f => f.startsWith('.key'));
let filenamesParseToFullPath = keysPath =>
    filenamesParse(keysPath)
        .map((v, _) => path.join(keysPath, v));

let filenamesParseToSpenders = keysPath => {
    return filenamesParseToFullPath(keysPath)
        .map((v, _) => {
            let key = fs.readFileSync(v);
            return new Wallet(key.toString()).address;
        })
}

program
    .command('list')
    .addOption(networkNameOption)
    .addOption(tokenIdOption)
    .addOption(keysPathOption)
    .action(async (options) => {
        await list(options.networkName, filenamesParseToFullPath(options.keysPath), options.tokenId);
    });

program
    .command('create')
    .addOption(keysPathOption)
    .option('-n, --keys-Count <keysCount>', 'create Keys Count', myParseInt, 1)
    .action(options => {
        create(options.keysPath, options.keysCount);
    });

program
    .command('approve')
    .addOption(keysPathOption)
    .addOption(tokenIdOption)
    .addOption(networkNameOption)
    .action(async options => {
        await batchApprove(options.networkName, filenamesParseToSpenders(options.keysPath), options.tokenId);
    });

program
    .command('transfer')
    .addOption(keysPathOption)
    .addOption(networkNameOption)
    .option('-v, --amount <amount>', 'transfer amount to each spender')
    .option('-f, --filterAmount <filterAmount>', 'filter amount')
    .action(async options => {
        await batchTransfer(options.networkName, filenamesParseToSpenders(options.keysPath), options.amount, options.filterAmount);
    });

program
    .command('deploy')
    .addOption(networkNameOption)
    .action(async options => {
        await deployBrokerAccepter(options.networkName);
    })
program.parse();

async function list(networkName: string, filenames: Array<string>, tokenId: number) {
    let accepter = AccepterContractAddress[networkName];// secret['accepter-addr'];
    let zkLinkContract = new Contract(contract_addrss[networkName], JSON.stringify(zkLink.abi), providers[networkName]);
    let governanceContract = new Contract(GovernanceAddress[networkName], JSON.stringify(Governance.abi), providers[networkName]);
    let tokenAddress = await governanceContract.tokenAddresses(tokenId);
    let ERC20Contract = new Contract(tokenAddress, JSON.stringify(MockErc20.abi), providers[networkName]);
    let pendingBalance = await zkLinkContract.getPendingBalance(accepter, tokenAddress);
    let allownance = await ERC20Contract.allowance(accepter, contract_addrss[networkName]);
    let accpeterTable = new AsciiTable("Accepter Info");
    accpeterTable.addRow('Accepter Contract Address', accepter);
    accpeterTable.addRow('Token Contract Address', tokenAddress);
    accpeterTable.addRow('Token Name', await ERC20Contract.name());
    accpeterTable.addRow('Token Symbol', await ERC20Contract.symbol());
    accpeterTable.addRow('Balance', formatEther(await ERC20Contract.balanceOf(accepter)));
    accpeterTable.addRow('Allownance', formatEther(allownance));
    accpeterTable.addRow('PendingBalance', formatEther(pendingBalance));
    console.log(accpeterTable.toString())
    var table = new AsciiTable()
    table.setHeading('Signer Addr', 'Gas Coin Balance', 'Broker Allowance');
    Promise.all(filenames.map(async (v, _) => {
        let key = fs.readFileSync(v);
        let wallet = new Wallet(key.toString(), providers[networkName]);
        let balance = await wallet.getBalance();
        let allowanceAmount = await zkLinkContract.brokerAllowance(tokenId, accepter, wallet.address);
        let arr = [wallet.address, formatEther(balance), formatEther(allowanceAmount)];
        table.addRow.apply(table, arr);
    })).then(() => {
        console.log(table.toString());
    })
}

function create(keysPath: string, keysCount: number) {
    let account = new Accounts();
    for (let i = 0; i < keysCount; i++) {
        let obj = account.create();
        console.log(i, "\t", obj.address);

        let filename = path.join(keysPath, [".key-", obj.address, ".key"].join(""));
        console.log("write: ", filename);
        fs.writeFileSync(filename, obj.privateKey);
    }
}

async function batchApprove(networkName: string, spenders: Array<string>, tokenId: number) {
    let accepterOwner = new Wallet(secret['accepter-key'], providers[networkName]);
    console.log(spenders);
    let batch = new Contract(AccepterContractAddress[networkName], JSON.stringify(BrokerAccepter.abi), accepterOwner);
    let gasLimit = spenders.length * 50000;
    let tx = await batch.connect(accepterOwner).batchApprove(contract_addrss[networkName], GovernanceAddress[networkName], spenders, tokenId, BigNumber.from("0xffffffffffffffffffffffffffffffff"), { gasLimit: gasLimit })
    console.log(tx);
}

async function batchTransfer(networkName: string, spenders: Array<string>, amount: string, minAmount: string) {
    let accepter = new Wallet(secret['accepter-key'], providers[networkName]);
    console.log(spenders);
    let batch = new Contract(AccepterContractAddress[networkName], JSON.stringify(BrokerAccepter.abi), accepter);
    let gasLimit = spenders.length * 30000;
    let _amount = parseEther(amount);
    let value = _amount.mul(spenders.length + "")
    let tx = await batch.connect(accepter).bacthTransfer(spenders, _amount, parseEther(minAmount), { gasLimit: gasLimit, value: value })
    console.log(tx);
}

async function deployBrokerAccepter(networkName: string) {
    let accepter = new Wallet(secret['accepter-key'], providers[networkName]);
    let gasPrice = await accepter.getGasPrice();
    let tx = await deployContract(accepter, BrokerAccepter, [], { gasLimit: 5000000, gasPrice: gasPrice.mul("2") });
    console.log(tx.address);
}
