import * as sha256JS from "crypto-js/sha256.js" // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
// import {EC} from "elliptic/lib/elliptic/ec/index.js" ecma5 ile yazıldığı için export {EC} değil module.exports = EC bu yüzden require ile atama gerekiyor.
// Yukarıdakilerin çalışması için type defination lazım olursa npm i @types/elliptic --save-dev şeklinde @types'ları indirmek gerek. 
const EC = require("elliptic/lib/elliptic/ec/index.js");

const SHA256 = sha256JS;
const ec = new EC("secp256k1");


class Block{

    public Timestamp:number;
    public Data:object = [];
    public PrevBlockHash:string = "";
    public Hash:string = this.setHash();

    constructor(_timestamp:number,_data:object,_prevBlockHash:string) {
        this.Timestamp = _timestamp;
        this.Data = _data;
        this.PrevBlockHash = _prevBlockHash;
        this.Hash = this.setHash();
    }


    setHash(){
        return SHA256(this.Timestamp + JSON.stringify( this.Data) + this.PrevBlockHash).toString();
    }

}


class Blockchain{
 
    public Blocks:Block[];

    constructor() {
        this.Blocks = [this.createGenesisBlock()];
        
    }

    createGenesisBlock(){
        return new Block(Date.now(),{},"genesis")
    }

    addBlock(_data:object){
       let prevBlock = this.Blocks[this.Blocks.length -1];
       let newBlock= new Block(Date.now(),_data,prevBlock.Hash);
       this.Blocks.push(newBlock);
    }
}

let ISO = new Blockchain();
ISO.addBlock({amount:100});
console.log(JSON.stringify(ISO,null,4));