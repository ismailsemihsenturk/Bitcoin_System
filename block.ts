import * as sha256JS from "crypto-js/sha256.js" // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
import { AbstractCursor, Collection, CollectionInfo, Db, MongoClient, UpdateResult } from "mongodb";
import { resolve } from "path";
import { MongoService } from "./mongoDb/mongoService";
import "dotenv/config"
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'node:process'
const Bitcoin = require('bitcoin-address-generator');

// import * as ECobj from "elliptic/lib/elliptic/ec/index.js";" ecma5 ile yazıldığı için export {EC} değil module.exports = EC bu yüzden require ile atama gerekiyor.
// Yukarıdakilerin çalışması için type defination lazım olursa npm i @types/elliptic --save-dev şeklinde @types'ları indirmek gerek. 
const EC = require("elliptic/lib/elliptic/ec/index")
const SHA256 = sha256JS;
const ec = new EC("secp256k1");




export interface IBlockStructure {
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
        txID: [],
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

export type IBlockStructureType = IBlockStructure[];


class Block implements IBlockStructure {

    MongoDb_Service = new MongoService();
    Hash: string;
    Console: boolean = false;
    IO_index: number;

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
        txID: [];
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
        this.transactions.push(_transactions);
        this.Hash = this.setHash(this.Blockheader);
        this.IO_index = 0;

    }

    setHash(_blockheader) {

        let merkleObj = [[""]];
        for (let i = 0; i < this.transactions.length; i++) {
            for (let y = 0; y < this.transactions[i].txID.length; y++) {
                merkleObj[i][y] = this.transactions[i].txID[y];
            }

        }

        this.Blockheader.merkleRoot = SHA256(JSON.stringify(merkleObj)).toString();
        let BlOCKHASH = SHA256(JSON.stringify(_blockheader)).toString();

        if (this.Blockheader.prevBlockHash !== "genesis") {
            //this.getHash();
            this.Blockheader.prevBlockHash = BlOCKHASH;
        }
        return BlOCKHASH
    }

    getHash() {
        let str = this.MongoDb_Service.getHash();
        this.Blockheader.prevBlockHash = str.substring(1, str.length - 1)
        // console.log("prev: "+this.Blockheader.prevBlockHash)
    }

    mineBlock() {

        while (this.Hash.substring(0, this.Blockheader.difficulty) !== Array(this.Blockheader.difficulty + 1).join("0")) {
            this.Blockheader.nonce++;
            this.Hash = this.setHash(this.Blockheader);
        }
        console.log("Nonce: " + this.Blockheader.nonce + "\n" + "Block mined: " + this.Hash);


        //Kazıyıcı ödülü
        this.transactions[this.transactions.length - 1].Vout[0].ScrriptPubKey = String(process.env.ADDRESS1);

        let blockSizeStr = JSON.stringify(this.Magic_no) + JSON.stringify(this.Blockheader) + JSON.stringify(this.Transaction_counter) + JSON.stringify(this.transactions);
        this.Blocksize = blockSizeStr.length


        if (!this.Console && this.Blockheader.prevBlockHash !== "genesis") {
            this.ConsoleQuestion();
        }

        this.MongoDb_Service.addMongo_Blocks(this.Blocksize, this.Blockheader, this.Transaction_counter, this.transactions);
        this.MongoDb_Service.addMongo_Chainstate(this.Blockheader.prevBlockHash, this.Hash)

        this.IO_index++;
    }


    ConsoleQuestion() {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Tx eklemeye devam etmek ister misiniz? [y/n] ", (answer) => {
            switch (answer.toLowerCase()) {
                case 'y':

                    rl.question("PublicKey Miktar", (txData) => {

                        let txString = txData.trimStart().split(" ");
                        if (txString[1] === undefined) {
                            console.log("HATALI KULLANIM \n Doğru Kullanım: Adres Miktar ");
                            rl.close();
                            this.ConsoleQuestion();
                        }

                        console.log("txString: " + txString);
                        let txAddress = txString[0];
                        let txAmount = Number(txString[1]);

                        if (isNaN(txAmount)) {
                            console.log("HATALI KULLANIM \n Doğru Kullanım: Adres Miktar ");
                            rl.close();
                            this.ConsoleQuestion();
                        }

                        let index = this.transactions.length - 1
                        let Vindex = this.transactions[index].Vin.length - 1;
                        let Voutindex = this.transactions[index].Vout.length - 1;

                        //  Tx [1] { 

                        //     txId[1]  
                        //     Vın[1]  = index, prevTxHash, ScriptSig (Sign, PubKey)
                        //     Vout[1] = value, PublicKeyHash (Hashed Public Key)

                        //  }

                        let signTx;
                        let txInput = new TxInput(this.IO_index, this.transactions[index].txID[Vindex], signTx, process.env.PUBLIC_KEY2);

                        let InputPublicKeyHash = Bitcoin.PublicKeyToPublicKeyHash(process.env.PUBLIC_KEY2);
                        let OutputPublicKeyHash = Bitcoin.AddressToPublicKeyHash(txAddress) //process.env.ADDRESS2

                        let txOutput = new TxOutput(1000,OutputPublicKeyHash);
                        
                        let TxHash = SHA256(JSON.stringify(txInput) + JSON.stringify(txOutput)).toString();
                        let TxInstance = new Transaction([TxHash],[txInput],[txOutput]);
                        let signingKey = ec.keyFromPrivate(process.env.PRIVATE_KEY_2);

                        const sig = signingKey.sign(TxHash, "base64");
                        signTx = sig.toDER("hex");
                        
                        TxInstance.Vin[Vindex].Signature = signTx;

                        this.transactions.push(JSON.parse(JSON.stringify(TxInstance)));
                     
                        
                        // Input içindeki PublicKey'i hashleyip, Output içindeki Addres => Hashed Public Key ile karşılaştırıp. Aynı olup olmadıklarına bakıyoruz. Böylelikle input-output referansı olacak ve coinleri gönderen kişinin o kişi olduğu kanıtlanmış olacak.
                        let BytesCompare = Buffer.compare(InputPublicKeyHash,OutputPublicKeyHash)






                    })

                    console.log("Tx eklendi.!");
                    this.Console = true;
                    this.mineBlock()
                    rl.close();
                    this.ConsoleQuestion()

                    break;
                case 'n':
                    console.log("Çıkış yapılıyor.");
                    rl.close();
                    break;
                default:
                    console.log("Geçersiz komut!");
            }
            rl.close();
        });
    }


}

class Blockchain implements IBlockStructure {

    public Blocks: Block[] = [];
    public Genesis: boolean = false;
    public addObj: IBlockStructureType;

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
        txID: [];
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

        // Node'a yeni bağlanan kişi server'dan bütün blokcları çeker.
        const MongoDb_Service = new MongoService();
        let docs_Blocks = await MongoDb_Service.initiateMongoDB();

        if (docs_Blocks[docs_Blocks.length - 1].Blockheader.prevBlockHash === "genesis") { this.Genesis = true; }

        for (let i = 0; i < docs_Blocks.length; i++) {
            this.Blocksize = Number(JSON.stringify(docs_Blocks[i].Blocksize));

            this.Blockheader = JSON.parse(JSON.stringify(docs_Blocks[i].Blockheader));

            this.Transaction_counter = Number(JSON.stringify(docs_Blocks[i].Transaction_counter));

            this.transactions = JSON.parse(JSON.stringify(docs_Blocks[i].transactions));

            this.addObj = [{ Magic_no: "ISO1998", Blocksize: this.Blocksize, Blockheader: this.Blockheader, Transaction_counter: this.Transaction_counter, transactions: this.transactions }];

            this.addBlock(this.addObj);

        }

    }

    addBlock(_addObj: IBlockStructureType) {

        // İlk bloğu minela.
        if (this.Genesis) {
            this.Blocks.push(new Block(_addObj[0].Blocksize, _addObj[0].Blockheader, _addObj[0].Transaction_counter, _addObj[0].transactions));

            // console.log("createGenesisBlock: " + JSON.stringify(this.Blocks[this.Blocks.length - 1], null, 5))

            this.Blocks[this.Blocks.length - 1].mineBlock()

        }
        else { // Node'dakileri ram'e aktar.
            for (let i = 0; i < _addObj.length; i++) {
                this.Blocks.push(new Block(_addObj[i].Blocksize, _addObj[i].Blockheader, _addObj[i].Transaction_counter, _addObj[i].transactions));
            }
            console.log((this.Blocks))
            // Ramdekileri aldıktan sonra kendi ekleyeceğin bloğu minela.
            this.Blocks[this.Blocks.length - 1].mineBlock()
        }


    }
}

class Wallet {
    // tsconfig "strictPropertyInitialization": false ya da "!" veya static kullan.
    public publicKey: string;
    public privateKey: string;
    public publicKeyHash: any = [];

    constructor() {
        // const key = ec.genKeyPair();
        // this.publicKey = key.getPublic("hex");
        // this.privateKey = key.getPrivate("hex");

        this.publicKeyHash.push(Bitcoin.generatePublicKeyHash(process.env.PRIVATE_KEY1))
        this.publicKeyHash.push(Bitcoin.generatePublicKeyHash(process.env.PRIVATE_KEY2))
        this.publicKeyHash.push(Bitcoin.generatePublicKeyHash(process.env.PRIVATE_KEY3))
        //Bitcoin.createPublicAddress(this.publicKeyHash[0])
    }

    async WalletInstance() {


        let Wallets = [{
            PRIVATE_KEY: process.env.PRIVATE_KEY1,
            PUBLIC_KEY: process.env.PUBLIC_KEY1,
            ADDRESS: process.env.ADDRESS1
        },
        {
            PRIVATE_KEY: process.env.PRIVATE_KEY2,
            PUBLIC_KEY: process.env.PUBLIC_KEY2,
            ADDRESS: process.env.ADDRESS2
        },
        {
            PRIVATE_KEY: process.env.PRIVATE_KEY3,
            PUBLIC_KEY: process.env.PUBLIC_KEY3,
            ADDRESS: process.env.ADDRESS3
        },
        ]

        return Wallets;
    }

}

class Transaction {

    public txID: string[]; //byte
    public Vin: TxInput[];
    public Vout: TxOutput[];

    constructor(_id: string[], _vIn: TxInput[], _vOut: TxOutput[]) {

        this.txID = _id;
        this.Vin = _vIn;
        this.Vout = _vOut;

    }


}


class TxInput {

    public Index: number; // Bir önceki Tx içerisindeki kaçıncı output.
    public PrevTx: number; //  Bir önceki Transaction'ın hashi
    public Signature: any = [];
    public PubKey: any = [];
    // TxOutput'un scriptPubkey'inde (PubKeyHash) kullanılmak için gerekli data'yı sağlar. Eğer data doğru ise output açılır ve içindeki "Value"ya erişilir. Eğer yanlışsa output-input'u referans veremez ve böylelikle kimse başkasının parasını harcayamaz.

    constructor(_index, _prevTx, _signature, _pubKey) {

        this.Index = _index;
        this.PrevTx = _prevTx;
        this.Signature.push(_signature);
        this.PubKey.push(_pubKey);

    }

}


class TxOutput {

    public Value: number; //Satoshi miktarı, BTC'nin 100 milyonda biri.
    public PubKeyHash: any = []; //Para gönderilecek kişinin cüzdan adresi

    constructor(_value, _pubKeyHash) {

        this.Value = _value;
        this.PubKeyHash.push(_pubKeyHash);
    }

}


// let ISO = new Blockchain();
// ISO.addBlock({amount:100});
// ISO.addBlock({amount:200});

// let ISO_Block = new Block(Date.now(),{iso:"ismail semih şentürk"},"abc");
// ISO_Block.mineBlock(3);
// console.log(JSON.stringify(ISO,null,4));

export { Blockchain, Block, Wallet, Transaction, TxInput, TxOutput };