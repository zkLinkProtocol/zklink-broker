# zkLink Broker
## config
Add `./secret.json` first

```json
{
    "prikey":"",
    "zkLinkContractAddress":""
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

## setup
```
yarn install
```

### compile solidity
```
yarn build
```

### run
```
npx ts-node src/index.ts --accepter 0xABCD
```