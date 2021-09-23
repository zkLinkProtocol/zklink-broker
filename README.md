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

### Example
- create key 
  - -c : create keys count
    
  `npx ts-node src/utils/prikey-tools.ts -t create -c 10 -p /your/path`

- list key gas coin balance and broker_allowance 
  
    `npx ts-node src/utils/prikey-tools.ts -t list -p /your/path --cid 0 --tid 4`

- approve broker, approve singer to sign broker tx instead of accepter(config at secre.json@accepter-addr)
  - --tid : token id
  - 
  `npx ts-node src/utils/prikey-tools.ts -t approve -p /your/path --cid 0 --tid 4`

- batch transfer gas coin
  - -p : key path
  - --cid : chain id
  - --amount : transfer amount
  - --min_amount : filter

  `npx ts-node src/utils/prikey-tools.ts -c 1 -p /your/path -t transfer --cid 0 --amount 0.001 --min_amount 0.5`
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