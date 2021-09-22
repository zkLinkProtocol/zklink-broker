import secret from "../secret.json"
import { promisify } from 'util'
import { readFile as _readFile, readdir as _readdir } from 'fs'
import path from 'path'

const readFile = promisify(_readFile);
const readdir = promisify(_readdir);

let signerCache = [];
let cur = 0;
async function init(): Promise<number> {
    let files = await readSignerFile();
    signerCache = await checkSigners(files);

    return signerCache.length;
}

function getSigner():string {
    let res = signerCache[cur];
    cur = (cur + 1) % signerCache.length;
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
async function checkSigners(keys) {
    //check format len=64
    //check ETH balance(BNB,MATIC...)
    //check allowance
    return keys
}

setInterval(async () => {
    signerCache = await checkSigners(signerCache);
    //TODO 
    if (signerCache.length < 10) {
        //notify admin, mail,sms...
    }
    if (signerCache.length == 0) {
        process.exit();
    }
}, 60000);//60s
export {
    init as initSigner,
    getSigner
}