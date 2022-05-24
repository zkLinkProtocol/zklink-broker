import { providers } from "ethers"

const mainnet_network_map: string[] = [];

const mainnet_providers = {

}


// 1 2 3 4
const testnet_network_map: string[] = ["matic_test", "avax_test", "rinkeby", "goerli"]
const testnet_providers = {
    rinkeby: new providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", {
        name: "rinkeby-testnet",
        chainId: 4,
    }),
    matic_test: new providers.JsonRpcProvider("https://matic-mumbai.chainstacklabs.com", {
        name: "matic-testnet",
        chainId: 80001,
    }),
    goerli: new providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", {
        name: "goerli-testnet",
        chainId: 5,
    }),
    avax_test: new providers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc", {
        name: "avax-testnet",
        chainId: 43113,
    }),
}

const testnet_token_contract_map = new Map([
    ["QUICK", "0xaac36c620e2f52aec3eeed2b89a2ea19babb132a"],
    ["KRILL", "0x5122fa43c7d6da72ecf423f4955a0cc38753dab2"],
    ["MDX", "0xe583769738b6dd4E7CAF8451050d1948BE717679"],
    ["COW", "0x1A508809A119Eee6F4b7ADeef3f2a9b4479608Ac"],
    ["XVS", "0xAAC36C620E2f52AeC3EeEd2b89A2eA19BAbB132A"],
    ["AUTO", "0x5122fa43c7D6dA72Ecf423F4955A0cC38753dab2"],
    ["UNI", "0x8Dc5CA19e64ade17aEEB4F8c52BF8ff220eD17dE"],
    ["SUSHI", "0xFced6f29c8BE8C1A679fBc7Ebb0AC1D3298e775e"],
    ["SRM", "0x80101F4da93A2912DC41b8eDBB30b98d428b8C43"],
    ["RAY", "0xd42b3eebb2e86ef83f78eFB7d5432912D5F9259c"]
]);

export {
    testnet_providers as providers,
    //mainnet_providers as providers,
    testnet_network_map as networkMap,
    testnet_token_contract_map as tokenContractMap

}
