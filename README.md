# zkLink Broker
## config
Add `./secret.json` first

```json
{
    "broker-name":"", // Each instance should have a unique identity
    "mongo-uri":"", // mongodb connection uri
    "mongo-db-name":"", // mongodb db name
    "accepter-key":"", //option. accepter prikey, if the broker do not need to pay ETH,BNB,MATIC..., no need to fill this item.
    "accepter-addr":"",// accepter's address
    "signer-files-path":"", //local fs path, store all signer prikey
    "port":3000
}
```


and then, create `./contract_address.json`
```json
{
    "rinkeby": "",
    "matic_test": "",
    "goerli": "",
    "heco_test": ""
}
```

## broker system design
### Init
* read local fs, `signer-files-path`, this broker's signer key files.(different broker instance must hold different signer keys.)
* check signer format is correct
* check signer's balance
* check if the accepter had set allowance for signer 
* cache all signer keys in memory

### broker sign
* one by one to use signer key
* ...

## Key Tool
key-tools.ts helps you to create or list all signer keys.
### src/utils/prikey-tools.ts
command : `npx ts-node src/utils/prikey-tools.ts`

- `-t : type - create|list|approve`
- `-c : count - create keys count`
- `-p : path - create or list keys path`
- `--cid : chain id`
- `--tid : token id`
## Setup
```
yarn install
```

### run
```
npx ts-node src/index.ts
```