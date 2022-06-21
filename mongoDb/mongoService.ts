import { Block, Blockchain, Wallet, Transaction, TxInput, TxOutput, IBlockStructure, IBlockStructureType } from "../block";
import { AbstractCursor, AggregationCursor, Collection, CollectionInfo, Db, MongoClient, ObjectId, UpdateResult } from "mongodb";
import { resolve } from "path";
import { callbackify } from "util";
import { mainModule } from "process";
import { SHA256 } from "crypto-js";
import { type } from "os";
const blockDocs = require("./mongoDocs/blocks.json");
const chainstateDocs = require("./mongoDocs/chainstate.json");
const Bitcoin = require('bitcoin-address-generator');
//import blockDocs from "./mongoDocs/blocks.json";


class MongoService {

    public Client: MongoClient;
    public DbObject: Db;

    public DbName = "BlockChain_System";
    public C_Blocks_Prop = blockDocs.validator.$jsonSchema.properties;


    constructor() {
        this.Client = new MongoClient("mongodb://localhost:27017");
        this.DbObject = new Db(this.Client, this.DbName);
        // this.Collection_IsoCoin = this.DbObj.collection("Iso_Coin");

    }

    async initiateMongoDB(): Promise<IBlockStructureType> {

        let block_exist = false;
        let block_docs;



        try {
            // Use connect method to connect to the server
            await this.Client.connect();
            console.log("Server'a bağlandı. ");
            let dbobj = this.Client.db(this.DbName);

            let CollectionArr = [{
                colName: "blocks",
                schema: blockDocs,
                colCount: (await dbobj.collection("blocks").distinct('_id')).length
            },
            {
                colName: "chainstate",
                schema: chainstateDocs,
                colCount: (await dbobj.collection("chainstate").distinct('_id')).length
            }]


            //colDocCount: (await dbobj.collection("chainstate").distinct('_id')).length
            // Db içerisindeki bütün col. isimleri
            let listCol = (await dbobj.listCollections().toArray()).map(n => n.name);

            for (const index of CollectionArr) {

                if (!listCol.includes(index.colName)) {
                    await dbobj.createCollection(index.colName, index.schema);
                    console.log(index.colName + " oluşturuldu");
                }
                else {
                    console.log(index.colName + " isimli tablo zaten var.");

                    if (index.colName === "blocks" && index.colCount !== 0) {
                        block_exist = true;
                    }
                    console.log(block_exist)
                }
            }

            HashObj = await dbobj.collection("chainstate").find().toArray();
            HashStr = JSON.stringify(HashObj[HashObj.length - 1].Hash);

            if (block_exist) { // DB check

                block_docs = await dbobj.collection("blocks").find().toArray();
                //colBlocks = await dbobj.collection("blocks").find().sort({ $natural: -1 }).limit(1).toArray(); 
                // reverse en son veri en üstte olacak.

                let blockStructure: IBlockStructure[] = block_docs;
                let addBlocktoStructure: IBlockStructure[] = [];

                addBlocktoStructure[0].Blocksize = 0;
                addBlocktoStructure[0].Blockheader.version = 0;
                addBlocktoStructure[0].Blockheader.prevBlockHash = "ali";
                addBlocktoStructure[0].Blockheader.merkleRoot = "";
                addBlocktoStructure[0].Blockheader.timestamp = Date.now();
                addBlocktoStructure[0].Blockheader.difficulty = 2;
                addBlocktoStructure[0].Blockheader.nonce = 0;
                addBlocktoStructure[0].Transaction_counter = TxInstance.length;
                addBlocktoStructure[0].transactions = JSON.parse(JSON.stringify(TxInstance));

                console.log("blokstructure: " + JSON.stringify(blockStructure[0]));

                this.Client.close();
                blockStructure.push(addBlocktoStructure[0])
                return blockStructure

            }
            else { //Genesis

                console.log("genesis'e geldi");
                this.Client.close();
                return [{
                    Magic_no: "ISO1998",
                    Blocksize: 0,
                    Blockheader: {
                        version: 0,
                        prevBlockHash: "genesis",
                        merkleRoot: "",
                        timestamp: Date.now(),
                        difficulty: 2,
                        nonce: 0
                    },
                    Transaction_counter: TxInstance.length,
                    transactions: JSON.parse(JSON.stringify(TxInstance))
                }]
            }

            this.Client.close();
        }
        catch (error) {
            console.log(error);
        }

        return [{ //block exist true
            Magic_no: "ISO1998",
            Blocksize: 0,
            Blockheader: {
                version: 0,
                prevBlockHash: "",
                merkleRoot: "",
                timestamp: Date.now(),
                difficulty: 2,
                nonce: 0
            },
            Transaction_counter: TxInstance.length,
            transactions: JSON.parse(JSON.stringify(TxInstance))
        }]

    }


    async addMongo_Blocks(_Blocksize, _Blockheader, _Transaction_counter, _transactions) {

        colBlocks[colBlocks.length - 1]._id = new ObjectId();
        colBlocks[colBlocks.length - 1].Blocksize = _Blocksize;
        colBlocks[colBlocks.length - 1].Blockheader = _Blockheader;
        colBlocks[colBlocks.length - 1].Transaction_counter = _Transaction_counter;
        colBlocks[colBlocks.length - 1].transactions = _transactions;

        await this.DbObject.collection("blocks").insertOne(colBlocks[colBlocks.length - 1]);
    }

    async addMongo_Chainstate(_prevHash, _hash) {

        let addObj = {
            _id: new ObjectId(),
            prevHash: _prevHash,
            Hash: _hash
        }
        console.log("prev mongo: " + addObj.prevHash);
        await this.DbObject.collection("chainstate").insertOne(addObj);
    }

    getHash() {
        return HashStr;
    }

    // async updateMongo(colName: string, _updateFilter: any, _updateObj: any) {
    //     let updateObj = this.DbObject;
    //     const updateResult = await updateObj.collection(colName).updateOne(_updateFilter, _updateObj);

    // }

    // async deleteMongo(colName: string, _deleteObj: any) {
    //     let deleteObj = this.DbObject;
    //     const deleteResult = await deleteObj.collection(colName).deleteOne(_deleteObj);

    // }



}

// -------------VARIABLES-------------
let MyWallet: Wallet;
let Wallet_Arr;
let Iso_MongoService;
let BlockChainInstance: Blockchain;
let TxInstance: Transaction[] = [];
let In_TxInstance: TxInput[] = [(new TxInput(-1, -1, ["Coinbase Tx"],["genesis"]))];
let Out_TxInstance: TxOutput[] = [(new TxOutput(100000, "Miner Public Key Hash"))];
let HashObj;
let HashStr;

let colBlocks = [{
    _id: new ObjectId(),
    Magic_no: "ISO1998",
    Blocksize: 0,
    Blockheader: {
        version: 0,
        prevBlockHash: "",
        merkleRoot: "",
        timestamp: Date.now(),
        difficulty: 2,
        nonce: 0
    },
    Transaction_counter: 0,
    transactions: [{
        txID: "",
        Vin: [{
            Index: 0,
            PrevTx: "",
            ScriptSig: ""
        }],
        Vout: [{
            Value: 0,
            ScrriptPubKey: ""
        }]
    }]
}];


function coinbaseTx() {
    // Coinbase Transaction reward ödülün taşır. Bundan dolayı:

    // ------- TX INPUT--------
    // Bir önceki transaction içindeki output'un index değeri yoktur.
    // Bir önceki tx hash'i yoktur.
    // ScripSig'de herhangi bir veri vardır.

    // ------- TX OUTPUT--------
    // Value: block ödülüdür. 
    // ScriptPubKey block'u minelayan kullanıcının public key'idir.

    let TxHash = SHA256(JSON.stringify(In_TxInstance[0]) + JSON.stringify(Out_TxInstance[0])).toString();
    Out_TxInstance[0].PubKeyHash = Bitcoin.AddressToPublicKeyHash(process.env.ADDRESS1)
    TxInstance.push(new Transaction([TxHash], In_TxInstance, Out_TxInstance));

}




async function main() {

    Iso_MongoService = new MongoService();
    MyWallet = new Wallet();
    Wallet_Arr = await MyWallet.WalletInstance(); //Wallet_Arr[0].PRIVATE_KEY

    // coinbaseTx();



    // BlockChainInstance = new Blockchain();

}
main();

//--------------------


export { MongoService }



