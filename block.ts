import * as sha256JS from "crypto-js/sha256.js" // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
import { AbstractCursor, Collection, CollectionInfo, Db, MongoClient, UpdateResult } from "mongodb";
import { resolve } from "path";
import { MongoService } from "./mongoDb/mongoService";
import "dotenv/config"

// import * as ECobj from "elliptic/lib/elliptic/ec/index.js";" ecma5 ile yazıldığı için export {EC} değil module.exports = EC bu yüzden require ile atama gerekiyor.
// Yukarıdakilerin çalışması için type defination lazım olursa npm i @types/elliptic --save-dev şeklinde @types'ları indirmek gerek. 
const EC = require("elliptic/lib/elliptic/ec/index")
const SHA256 = sha256JS;
const ec = new EC("secp256k1");


interface IBlockStructure {
    Magic_no: "ISO1998",
    Blocksize: number,
    Blockheader: {
        version: number,
        prevBlockHash: string,
        merkleRoot: string,
        timestamp: number,
        difficulty: number,
        nonce: number
    },
    Transaction_counter: number,
    transactions: [{
        txID: string,
        Vin: [{
            Index: number,
            PrevTx: string,
            ScriptSig: string
        }],
        Vout: [{
            Value: number,
            ScrriptPubKey: string
        }]
    }]
}

class Block implements IBlockStructure {

    Hash: string;

    Magic_no: "ISO1998";
    Blocksize: number;
    Blockheader: {
        version: number;
        prevBlockHash: string;
        merkleRoot: string;
        timestamp: number;
        difficulty: number;
        nonce: number;
    };
    Transaction_counter: number;
    transactions: [{
        txID: string;
        Vin: [{
            Index: number;
            PrevTx: string;
            ScriptSig: string;
        }];
        Vout: [{
            Value: number;
            ScrriptPubKey: string;
        }];
    }];

    constructor(_blocksize: number, _blockheader, _Transaction_counter: number, _transactions) {

        this.Blocksize = _blocksize;
        this.Blockheader = _blockheader;
        this.Transaction_counter = _Transaction_counter;
        this.transactions = _transactions;

        this.Hash = this.setHash(this.Blockheader);

    }


    setHash(_blockheader) {
        return SHA256(JSON.stringify(_blockheader)).toString();
    }

    mineBlock(_blockheader) {

        while (this.Hash.substring(0, _blockheader.difficulty) !== Array(_blockheader.difficulty + 1).join("0")) {
            _blockheader.nonce++;
            this.Hash = this.setHash(_blockheader);
        }
        console.log("Nonce: " + this.Blockheader.nonce + "\n" + "Block mined: " + this.Hash);
    }

}


class Blockchain implements IBlockStructure {

    public Blocks: Block[] = [];

    Magic_no: "ISO1998";
    Blocksize: number;
    Blockheader: {
        version: number;
        prevBlockHash: string;
        merkleRoot: string;
        timestamp: number;
        difficulty: number;
        nonce: number;
    };
    Transaction_counter: number;
    transactions: [{
        txID: string;
        Vin: [{
            Index: number;
            PrevTx: string;
            ScriptSig: string;
        }];
        Vout: [{
            Value: number;
            ScrriptPubKey: string;
        }];
    }];


    constructor() {
        this.createGenesisBlock();

    }

    async createGenesisBlock() {

        // Check the db 
        const MongoDb_Service = new MongoService();
        let docs_Blocks = await MongoDb_Service.initiateMongoDB();

        this.Blocksize = Number(JSON.stringify(docs_Blocks[0].Blocksize));

        this.Blockheader = JSON.parse(JSON.stringify(docs_Blocks[0].Blockheader));

        this.Transaction_counter = Number(JSON.stringify(docs_Blocks[0].Transaction_counter));

        this.transactions = JSON.parse(JSON.stringify(docs_Blocks[0].transactions));

        this.Blocks.push(new Block(this.Blocksize, this.Blockheader, this.Transaction_counter, this.transactions));

        console.log("block: " + JSON.stringify(this.Blocks[this.Blocks.length -1], null, 5))
    }

    addBlock(_data: Block) {
        // let prevBlock = this.Blocks[this.Blocks.length - 1];
        // let newBlock = new Block(Date.now(), _data, prevBlock.Hash);
        // this.Blocks.push(newBlock);
        // return new Promise(resolve => resolve({ blocks: this.deneme })) //this.Blocks
    }
}

class Wallet {
    // tsconfig "strictPropertyInitialization": false ya da "!" veya static kullan.
    public publicKey: string;
    public privateKey: string;

    constructor() {
        // const key = ec.genKeyPair();
        // this.publicKey = key.getPublic("hex");
        // this.privateKey = key.getPrivate("hex");

        this.publicKey = String(process.env.PUBLIC_KEY);
        this.privateKey = String(process.env.PRIVATE_KEY);

        console.log("Private: "+ this.privateKey + "\n" + "Public: "+this.publicKey)
    }


}

class Transaction {

    public ID: string; //byte
    public Vin: TxInput[];
    public Vout: TxOutput[];

    constructor() {


    }


}


class TxInput {

    public Index: any = []; // Txoutput'un index'i.
    public PrevTx: number; // Bir önceki Transaction'ın hashi
    public ScriptSig: string; // TxOutput'un scriptPubkey'inde kullanılmak için gerekli data'yı sağlar. Eğer data doğru ise output açılır ve içindeki "Value"ya erişilir. Eğer yanlışsa output-input'u referans veremez ve böylelikle kimse başkasının parasını harcayamaz.

    constructor() {


    }

}


class TxOutput {

    public Value: number; //Satoshi miktarı, BTC'nin 100 milyonda biri.
    public ScrriptPubKey: string; //Para gönderilecek kişinin cüzdan adresi

    constructor() {


    }

}


// let ISO = new Blockchain();
// ISO.addBlock({amount:100});
// ISO.addBlock({amount:200});

// let ISO_Block = new Block(Date.now(),{iso:"ismail semih şentürk"},"abc");
// ISO_Block.mineBlock(3);
// console.log(JSON.stringify(ISO,null,4));

export { Blockchain, Block, Wallet };