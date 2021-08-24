import { providers } from "ethers"

let _providers = {
    rinkeby: new providers.JsonRpcProvider("https://rinkeby.infura.io/v3/34d267a41d3248d9b8ae6393a3f81838",{
        name:"rinkeby-testnet",
        chainId: 4,
    }),
    matic_test: new providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com",{
        name:"matic-testnet",
        chainId: 80001,
    }),
    goerli: new providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",{
        name:"goerli-testnet",
        chainId: 5,
    })
}

export {
    _providers as providers,


}