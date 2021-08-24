# zkLink Broker
## config
Add `./secret.json` first

```json
{
    "prikey":"",
    "zkLinkContractAddress":""
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