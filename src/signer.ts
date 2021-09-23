import secret from "../secret.json"
import { promisify } from 'util'
import { readFile as _readFile, readdir as _readdir } from 'fs'
import path from 'path'
import { networkMap } from './conf'
const readFile = promisify(_readFile);
const readdir = promisify(_readdir);

let signerCache = [];//chainid => []
let cur = []; //chainid => cur
networkMap.forEach(() => {
    cur.push(0)
});
async function init(): Promise<number[]> {
    let files = await readSignerFile();
    await networkMap.forEach(async (_, k) => {
        cur.push(0)
        signerCache[k] = await checkSigners(files, k);
    });

    return signerCache.map(v => v.length);
}

function getSigner(chainId: number): string {
    let res = signerCache[chainId][cur[chainId]];
    cur[chainId] = (cur[chainId] + 1) % signerCache[chainId].length;
    return res;
}

// read files from secret[signer-files-path]
async function readSignerFile() {
    let signerFilesPath = secret["signer-files-path"];
    let filenames = await readdir(signerFilesPath);

    if (filenames.length == 0) {
        return [];
    }
    let res = [];
    for (let i = 0; i < filenames.length; i++) {
        let buf = await readFile(path.join(signerFilesPath, filenames[i]));
        res.push(buf.toString());
    }
    return res;
}

//TODO
async function checkSigners(keys, chainId: number) {
    //check format len=64
    //check ETH balance(BNB,MATIC...)
    //check allowance
    return keys
}

setInterval(async () => {
    signerCache.forEach(async (v, i) => {
        signerCache[i] = await checkSigners(v, i);
        //TODO 
        if (signerCache[i].length < 10) {
            //notify admin, mail,sms...
        }
        if (signerCache[i].length == 0) {
            process.exit();
        }
    })

}, 60000);//60s
export {
    init as initSigner,
    getSigner
}