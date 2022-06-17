import * as sha256JS from "crypto-js/sha256.js" // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
// import * as ECobj from "elliptic/lib/elliptic/ec/index.js";" ecma5 ile yazıldığı için export {EC} değil module.exports = EC bu yüzden require ile atama gerekiyor.
// Yukarıdakilerin çalışması için type defination lazım olursa npm i @types/elliptic --save-dev şeklinde @types'ları indirmek gerek. 
const EC = require("elliptic/lib/elliptic/ec/index")
const SHA256 = sha256JS;
const ec = new EC("secp256k1");

class Block {

    public Timestamp: number;
    public Data: object = [];
    public PrevBlockHash: string = "";
    public Hash: string = this.setHash();
    public Nonce: number;

    constructor(_timestamp: number, _data: object, _prevBlockHash: string) {
        this.Timestamp = _timestamp;
        this.Data = _data;
        this.PrevBlockHash = _prevBlockHash;
        this.Hash = this.setHash();
        this.Nonce = 0;
    }


    setHash() {
        return SHA256(this.Timestamp + JSON.stringify(this.Data) + this.PrevBlockHash + this.Nonce).toString();
    }

    mineBlock(difficulty: number) {
        while (this.Hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.Nonce++;
            this.Hash = this.setHash();
        }
        console.log("Nonce: " + this.Nonce + "\n" + "Block mined: " + this.Hash);
    }

}


class Blockchain {

    public Blocks: Block[];

    constructor() {
        this.Blocks = [this.createGenesisBlock()];

    }

    createGenesisBlock() {
        return new Block(Date.now(), {}, "genesis")
    }

    addBlock(_data: object) {
        let prevBlock = this.Blocks[this.Blocks.length - 1];
        let newBlock = new Block(Date.now(), _data, prevBlock.Hash);
        this.Blocks.push(newBlock);
        return this.Blocks
    }
}


class Transaction {

    public ID: any = []; //byte
    public Vin: TxInput;
    public Vout: TxOutput;

    constructor() {


    }


}


class TxInput {

    public Txid:any =[]; //byte Transaction'ın id'si.
    public Vout:number; //Transaction içindeki çıktının index'ini depolar
    public ScriptSig:string; // TxOutput'un scriptPubkey'inde kullanılmak için gerekli data'yı sağlar. Eğer data doğru ise output açılır ve içindeki "Value"ya erişilir. Eğer yanlışsa output-input'u referans veremez ve böylelikle kimse başkasının parasını harcayamaz.

    constructor() {


    }

}


class TxOutput {

    public Value: number; //Satoshi BTC'nin 100 milyonda biri.
    public ScrriptPubKey: string; //Kullanıcının cüzdan adresi

    constructor() {


    }

}


// let ISO = new Blockchain();
// ISO.addBlock({amount:100});
// ISO.addBlock({amount:200});

// let ISO_Block = new Block(Date.now(),{iso:"ismail semih şentürk"},"abc");
// ISO_Block.mineBlock(3);
// console.log(JSON.stringify(ISO,null,4));

export { Blockchain, Block };