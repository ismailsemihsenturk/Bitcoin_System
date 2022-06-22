import * as sha256JS from "crypto-js/sha256.js" // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
import * as cryptoAES from "crypto-js/aes.js"
import { AbstractCursor, Collection, CollectionInfo, Db, MongoClient, UpdateResult } from "mongodb";
import { resolve } from "path";
import { coinbaseTx, MongoService } from "./mongoDb/mongoService";
import "dotenv/config"
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'node:process'
import { json } from "stream/consumers";
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
            fromAddress: string,
            ScriptSig: string
        }],
        Vout: [{
            Value: number,
            toPublicKey: string,
            ScriptPubKey: any
        }]
    }]
}

interface ITx {

    txID: [],
    Vin: [{
        Index: number,
        PrevTx: string,
        fromAddress: string,
        ScriptSig: string
    }],
    Vout: [{
        Value: number,
        toPublicKey: string,
        ScriptPubKey: any
    }]
}


export type IBlockStructureType = IBlockStructure[];
type ITxType = ITx[];



class Block implements IBlockStructure {

    MongoDb_Service = new MongoService();
    Hash: string;
    coinBaseTxObj: TxOutput;
    Console: boolean = false;
    ValidTx: boolean = false;
    BlockchainTxs: Blockchain;
    AllTxs: ITxType;

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
        txID: [],
        Vin: [{
            Index: number,
            PrevTx: string,
            fromAddress: string,
            ScriptSig: string
        }],
        Vout: [{
            Value: number,
            toPublicKey: string,
            ScriptPubKey: any
        }]
    }]

    constructor(_blocksize: number, _blockheader, _Transaction_counter: number, _transactions) {

        this.Blocksize = _blocksize;
        this.Blockheader = _blockheader;
        this.Transaction_counter = _Transaction_counter;
        this.transactions.push(_transactions);
        this.Hash = this.setHash(this.Blockheader, this.transactions);

    }

    setHash(_blockheader, _transactions) {

        let BlOCKHASH = SHA256(JSON.stringify(_blockheader) + JSON.stringify(_transactions)).toString();

        if (this.Blockheader.prevBlockHash !== "genesis") {
            //this.getHash();
            this.Blockheader.prevBlockHash = BlOCKHASH;
        }
        return BlOCKHASH
    }

    setMerkleRoot() {

        //Merkle tree olarak yap. tek tek hashle sonra ikisini birleştir yine hasli çiftleri en son birlikte hashle
        let merkleObj = [""];
        let merkleRootObj = [""];
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions.length % 2 === 1 && i === this.transactions.length - 1) {
                merkleObj[i] = SHA256(JSON.stringify(this.transactions[i])).toString();
                merkleObj[i + 1] = SHA256(JSON.stringify(this.transactions[i])).toString();
            }
            else {
                merkleObj[i] = SHA256(JSON.stringify(this.transactions[i])).toString();
            }
        }
        let x = 0;
        let y = 1;
        for (let i = 0; i < merkleObj.length / 2; i++) {

            merkleRootObj[i] = SHA256(JSON.stringify(merkleObj[x]) + JSON.stringify(merkleObj[y])).toString();

            x += 2;
            y += 2;
        }

        this.Blockheader.merkleRoot = SHA256(JSON.stringify(merkleRootObj)).toString();
    }


    async mineBlock() {

        if (!this.Console && this.Blockheader.prevBlockHash !== "genesis") {
            await this.ConsoleQuestion();
            this.PoWAlgorithm();
        }
        else { // blockchain'in ilk bloğu
            this.PoWAlgorithm();
        }


    }


    PoWAlgorithm() {

        while (this.Hash.substring(0, this.Blockheader.difficulty) !== Array(this.Blockheader.difficulty + 1).join("0")) {
            this.Blockheader.nonce++;
            this.Hash = this.setHash(this.Blockheader, this.transactions);
        }

        //Block'u minelayan kişinin public key'i ile değiştirilir.
        let CryptedOutput = cryptoAES.encrypt("1000", String(process.env.ADDRESS1));
        this.transactions[this.transactions.length - 2].Vout[0].ScriptPubKey = CryptedOutput;
        console.log("Nonce: " + this.Blockheader.nonce + "\n" + "Block mined: " + this.Hash);



        let blockSizeStr = JSON.stringify(this.Magic_no) + JSON.stringify(this.Blockheader) + JSON.stringify(this.Transaction_counter) + JSON.stringify(this.transactions);
        this.Blocksize = blockSizeStr.length;


        this.MongoDb_Service.addMongo_Blocks(this.Blocksize, this.Blockheader, this.Transaction_counter, this.transactions);
        this.MongoDb_Service.addMongo_Chainstate(this.Blockheader.prevBlockHash, this.Hash)
    }


    async ConsoleQuestion() {
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("Tx eklemeye devam etmek ister misiniz? [e/h] ", (answer) => {
            switch (answer.toLowerCase()) {
                case 'e':

                    rl.question("Adres Miktar", (txData) => {

                        let txString = txData.trimStart().split(" ");
                        if (txString[1] === undefined) {
                            console.log("HATALI KULLANIM \n Doğru Kullanım: Adres Miktar ");
                            this.ValidTx = false;
                            rl.close();
                            this.ConsoleQuestion();
                        }

                        console.log("txString: " + txString);
                        let txAddress = txString[0];
                        let txAmount = Number(txString[1]);

                        if (isNaN(txAmount)) {
                            console.log("HATALI KULLANIM \n Doğru Kullanım: Adres Miktar ");
                            this.ValidTx = false;
                            rl.close();
                            this.ConsoleQuestion();
                        }


                        // let index = this.transactions.length - 1
                        // let Vindex = this.transactions[index].Vin.length - 1;
                        // let Voutindex = this.transactions[index].Vout.length - 1;

                        let coinBaseTxObj = coinbaseTx();
                        this.transactions.push(JSON.parse(JSON.stringify(coinBaseTxObj)));

                        let txInput: TxInput[] = [];
                        let txOutput: TxOutput[] = [];
                        let CryptedOutput = cryptoAES.encrypt(txAmount.toString(), txAddress);

                        //Inputlar için bütün tx'leri gezip unspent tx'lerden input girilir. 
                        // Bunun için chainstate tablosunu kullanacağız. Bütün unspent tx'ler orada olacak.
                        txInput = await this.getAllUnspentTxs(txAmount);
                        txOutput.push(new TxOutput(txAmount, txAddress, CryptedOutput));





                        //-------------------------------










                        //  Tx [1] { 

                        //     txId[1]  
                        //     Vın[1]  = index, prevTxHash, ScriptSig (Sign, PubKey)
                        //     Vout[1] = value, PublicKeyHash (Hashed Public Key)

                        //  }

                        // let signTx;


                        // let TxIOHash = SHA256(JSON.stringify(txInput) + JSON.stringify(txOutput)).toString();

                        // let TxInstance = new Transaction([""], [txInput], [txOutput]);

                        // let signingKey = ec.keyFromPrivate(process.env.PRIVATE_KEY1);
                        // let signinPubKey = signingKey.getPublic("hex");

                        // const sigIO = signingKey.sign(TxIOHash, "base64");
                        // signTx = sigIO.toDER("hex");

                        // TxInstance.Vin[Vindex].Signature = signTx;

                        // let TxHash = SHA256(JSON.stringify(TxInstance.Vin) + JSON.stringify(TxInstance.Vout)).toString();

                        // const sig = signingKey.sign(TxHash, "base64");
                        // signTx = sig.toDER("hex");

                        // TxInstance.txID[index] = TxHash;
                        // this.transactions.push(JSON.parse(JSON.stringify(TxInstance)));


                        // // Public key ile daha önce priv key'i kullanarak imzaladığımız hash'i biz mi imzaladık diye kontrol ediyoruz.
                        // let IOSignCompare = signinPubKey.verify(TxIOHash, signTx);
                        // let SignCompare = signinPubKey.verify(TxHash, signTx);




                        // Her şey tamam olduğunda.
                        this.setMerkleRoot();
                        await this.mineBlock();





                    })

                    console.log("Tx eklendi.!");
                    rl.close();
                    this.ConsoleQuestion()

                    break;

                case 'h':
                    console.log("Çıkış yapılıyor.");
                    rl.close();
                    break;
                default:
                    console.log("Geçersiz komut!");
            }
            rl.close();
        });
    }

    async getAllUnspentTxs(_txAmount) {

        //Db'den bütün unspentTx'leri çek ve input'a uygun olanları toplayıp geri yolla.
        this.AllTxs = await this.BlockchainTxs.TxsForUnspent();
        let _validInputTx: TxInput[] = [];
        let CryptedOutput;
        let DeCryptdedInput;
        let txAddress;
        let myAddress = String(process.env.ADDRESS1);

        for (let i = 0; i < this.AllTxs.length - 1; i++) {


        }


        CryptedOutput = cryptoAES.encrypt(_txAmount.toString(), txAddress);
        DeCryptdedInput = cryptoAES.decrypt(CryptedOutput, String(process.env.PRIVATE_KEY1));

        return _validInputTx;
    }



}

class Blockchain implements IBlockStructure {

    public Blocks: Block[] = [];
    public Genesis: boolean = false;
    public addObj: IBlockStructureType;
    public docs_Blocks: IBlockStructureType;

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
        txID: [],
        Vin: [{
            Index: number,
            PrevTx: string,
            fromAddress: string,
            ScriptSig: string
        }],
        Vout: [{
            Value: number,
            toPublicKey: string,
            ScriptPubKey: any
        }]
    }]


    constructor() { }

    async createGenesisBlock() {

        // Node'a yeni bağlanan kişi server'dan bütün blokcları çeker.
        await this.getAllChainfromDb();

        if (this.docs_Blocks[this.docs_Blocks.length - 1].Blockheader.prevBlockHash === "genesis") {
            this.Genesis = true;
        }

        for (let i = 0; i < this.docs_Blocks.length; i++) {
            this.Blocksize = Number(JSON.stringify(this.docs_Blocks[i].Blocksize));

            this.Blockheader = JSON.parse(JSON.stringify(this.docs_Blocks[i].Blockheader));

            this.Transaction_counter = Number(JSON.stringify(this.docs_Blocks[i].Transaction_counter));

            this.transactions = JSON.parse(JSON.stringify(this.docs_Blocks[i].transactions));

            this.addObj = [{ Magic_no: "ISO1998", Blocksize: this.Blocksize, Blockheader: this.Blockheader, Transaction_counter: this.Transaction_counter, transactions: this.transactions }];

            await this.addBlock(this.addObj);

        }

    }

    async addBlock(_addObj: IBlockStructureType) {

        // İlk bloğu minela.
        if (this.Genesis) {
            this.Blocks.push(new Block(_addObj[0].Blocksize, _addObj[0].Blockheader, _addObj[0].Transaction_counter, _addObj[0].transactions));

            // console.log("createGenesisBlock: " + JSON.stringify(this.Blocks[this.Blocks.length - 1], null, 5))

            await this.Blocks[this.Blocks.length - 1].mineBlock()

        }
        else { // Node'dakileri ram'e aktar.
            for (let i = 0; i < _addObj.length; i++) {
                this.Blocks.push(new Block(_addObj[i].Blocksize, _addObj[i].Blockheader, _addObj[i].Transaction_counter, _addObj[i].transactions));
            }
            console.log((this.Blocks))
            // Ramdekileri aldıktan sonra kendi ekleyeceğin bloğu minela.
            await this.Blocks[this.Blocks.length - 1].mineBlock()
        }


    }

    async getAllChainfromDb() {
        //Db'den bütün blockchain'i al.
        const MongoDb_Service = new MongoService();
        this.docs_Blocks = await MongoDb_Service.initiateMongoDB();
    }

    async TxsForUnspent(): Promise<ITxType> {

        let Client = new MongoClient("mongodb://localhost:27017");
        await Client.connect();
        let dbobj = Client.db(String(process.env.DB_NAME));
        let dbTxObj = dbobj.collection("blocks").distinct('transactions');
        let AllTxs: ITxType = [];
        for (let i = 0; i < (await dbTxObj).length - 1; i++) {
            AllTxs.push(dbTxObj[i]);
        }

        return AllTxs;
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

    public txID: string; //byte
    public Vin: TxInput[];
    public Vout: TxOutput[];

    constructor(_id: string, _vIn: TxInput[], _vOut: TxOutput[]) {

        this.txID = _id;
        this.Vin = _vIn;
        this.Vout = _vOut;

    }


}


class TxInput {

    public Index: number; // Bir önceki Tx içerisindeki kaçıncı output.
    public PrevTx: number; //  Bir önceki Transaction'ın hashi
    public ScriptSig: any; // Gösterdiğin input'un sana ait olduğunu kanıtlamak için decrpyted data.
    public fromAddress: string; // Output'u ödemek için daha önce sana senin public keylerinden birine gelmiş aktarım için public key adresi.

    // TxOutput'un scriptPubkey'inde (PubKeyHash) kullanılmak için gerekli data'yı sağlar. Eğer data doğru ise output açılır ve içindeki "Value"ya erişilir. Eğer yanlışsa output-input'u referans veremez ve böylelikle kimse başkasının parasını harcayamaz.

    constructor(_index, _prevTx, _scriptSig, _fromAddress) {

        this.Index = _index;
        this.PrevTx = _prevTx;
        this.ScriptSig = _scriptSig;
        this.fromAddress = _fromAddress;

    }

}


class TxOutput {

    public Value: number; //Satoshi miktarı, BTC'nin 100 milyonda biri.
    public toPublicKey: string;
    public ScriptPubKey: any = []; //Para gönderilecek kişinin cüzdan adresi ile şifrelenmiş veri.

    constructor(_value, _toPublicKey, _scriptPubKey) {

        this.Value = _value;
        this.toPublicKey = _toPublicKey;
        this.ScriptPubKey = _scriptPubKey;
    }

}


// let ISO = new Blockchain();
// ISO.addBlock({amount:100});
// ISO.addBlock({amount:200});

// let ISO_Block = new Block(Date.now(),{iso:"ismail semih şentürk"},"abc");
// ISO_Block.mineBlock(3);
// console.log(JSON.stringify(ISO,null,4));

export { Blockchain, Block, Wallet, Transaction, TxInput, TxOutput };