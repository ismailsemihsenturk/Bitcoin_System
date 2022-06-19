import { Block, Blockchain, Wallet } from "../block";
import { AbstractCursor, AggregationCursor, Collection, CollectionInfo, Db, MongoClient, UpdateResult } from "mongodb";
import { resolve } from "path";
import { callbackify } from "util";
const blockDocs = require("./mongoDocs/blocks.json");
const chainstateDocs = require("./mongoDocs/chainstate.json");
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

    async initiateMongoDB() {

        let block_exist = false;
        let colBlocks;


        try {
            // Use connect method to connect to the server
            await this.Client.connect();
            console.log("Server'a bağlandı. ");
            let dbobj = this.Client.db(this.DbName);

            let CollectionArr = [{
                colName: "blocks",
                schema: blockDocs
            },
            {
                colName: "chainstate",
                schema: chainstateDocs
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
                    index.colName === "blocks" ? block_exist = true :
                    console.log(block_exist)
                }
            }

            if (block_exist) {
                colBlocks = await dbobj.collection("blocks").find().sort({ $natural: -1 }).limit(1).toArray(); // reverse en son veri en üstte olacak.
                console.log("neden: "+ JSON.stringify(colBlocks))
            }
            else {
                colBlocks = [{
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
                }]
            }


            // collection içerisindeki bütün docs


            this.Client.close();
            return colBlocks

        } catch (error) {
            console.log(error);
        }

    }


    async addMongo(colName: string, _addObj: any) {
        let addObj = this.DbObject;
        const addResult = await addObj.collection(colName).insertOne(_addObj);
        
        BlockChainInstance.addBlock(_addObj);
    }

    async updateMongo(colName: string, _updateFilter: any, _updateObj: any) {
        let updateObj = this.DbObject;
        const updateResult = await updateObj.collection(colName).updateOne(_updateFilter, _updateObj);
        // const updateResult2 = await this.Collection_IsoCoin.updateOne(_updateFilter,_updateObj);
    }

    async deleteMongo(colName: string, _deleteObj: any) {
        let deleteObj = this.DbObject;
        const deleteResult = await deleteObj.collection(colName).deleteOne(_deleteObj);
        // const deleteResult = await this.Collection_IsoCoin.deleteOne(_deleteObj);
    }



}

let Iso_MongoService = new MongoService();
let BlockChainInstance = new Blockchain();
let MyWallet = new Wallet();


// Iso_MongoService.addMongo("blocks", _addObj_blocks);
//Iso_MongoService.addMongo("chainstate",_addObj_chainstate);


//--------------------


export { MongoService }



// ------------------------------------------------------------------------
//btoa= base64 encoding
//atob()= base64 decoding + JSON.parse(decoded)
//new Blob([]) = byte size

// let Block_Decoded = atob(Block_Encoded);
// let a = JSON.parse(Block_Decoded);
// console.log(a.Hash);


