# zkLink Broker
This program allows signers to replace accepter to sign for broker message, which speeds up the response time of brokers. 

And provides a tool of private-key management and states check for signers.
## config
`./conf/secret.json`

```json
{
    "broker-name": "<Each instance should have a unique identity>",
    "mongo-uri": "<mongodb connection uri>",
    "mongo-db-name": "<mongodb db name>",
    "accepter-key": "<option. accepter prikey, if the broker do not need to pay ETH,BNB,MATIC..., no need to fill this item.>",
    "signer-files-path": "<local fs path, store all signer prikey>",
    "port": 3000
}
```

`./conf/contract_address.json`
```json
{
    "rinkeby": "",
    "matic_test": "",
    "goerli": "",
    "heco_test": ""
}
```
`./conf/accepter_contract_address.json`
```json
{
    "rinkeby": "",
    "matic_test": "",
    "goerli": "",
    "heco_test": ""
}
```
`./conf/governance_address.json`
```json
{
    "rinkeby": "",
    "matic_test": "",
    "goerli": "",
    "heco_test": ""
}
```

## Key Tool
src/utils/prikey-tools.ts help to create or list all signer keys.

```
Usage: yarn broker [options] [command]

Options:
  -V, --version       output the version number
  -h, --help          display help for command

Commands:
  list [options]
  create [options]
  approve [options]
  transfer [options]
  deploy [options]
  help [command]      display help for command
```

### create signer prikey
```
Usage: yarn broker create [options]

Options:
  -p, --keys-path <keysPath>    Keys Path
  -n, --keys-Count <keysCount>  create Keys Count (default: 1)
  -h, --help                    display help for command
```

`yarn broker create -p /your/path/keys -n 10`

### list accepter and all keys info
```
Usage: yarn broker list [options]

Options:
  -c, --network-name <networkName>  Network Name (choices: "matic_test", "heco_test", "rinkeby", "goerli")
  -t, --token-id <tokenId>          Token ID
  -p, --keys-path <keysPath>        Keys Path
  -h, --help                        display help for command
```

`yarn broker list -c matic_test -p ./keys/ -t 1 `

### batch approve singer to sign broker'tx instead of accepter-contract
before `yarn broker approve`, should execute `yarn build` to compile smart contract code
```
Usage: yarn broker approve [options]

Options:
  -p, --keys-path <keysPath>        Keys Path
  -t, --token-id <tokenId>          Token ID
  -c, --network-name <networkName>  Network Name (choices: "matic_test", "heco_test", "rinkeby", "goerli")
  -h, --help                        display help for command
```

### batch transfer ETH(native chain token) to signers 

```
Usage: yarn broker transfer [options]

Options:
  -p, --keys-path <keysPath>         Keys Path
  -c, --network-name <networkName>   Network Name (choices: "matic_test", "heco_test", "rinkeby", "goerli")
  -v, --amount <amount>              transfer amount to each spender
  -f, --filterAmount <filterAmount>  filter amount
  -h, --help                         display help for command
```

## Setup
```
yarn install
```

### run
```
pm2 start
```

### stop
```
pm2 stop broker-server
```