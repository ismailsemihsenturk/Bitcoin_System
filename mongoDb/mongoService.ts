import { Blockchain } from "../block";
import { AbstractCursor, Collection, CollectionInfo, Db, MongoClient, UpdateResult } from "mongodb";
import { resolve } from "path";
const blockDocs = require("./mongoDocs/blocks.json");
const chainstateDocs = require("./mongoDocs/chainstate.json");
//import blockDocs from "./mongoDocs/blocks.json";


class MongoService {

    public Blockchain: Blockchain;
    public Client: MongoClient;
    public DbObject: Db;
    public mongoDbInit: Promise<string>;

    public DbName = "BlockChain_System";
    public Collection_Blocks: Collection<Document>;
    public C_Blocks_Prop = blockDocs.validator.$jsonSchema.properties;


    constructor() {
        this.Client = new MongoClient("mongodb://localhost:27017");
        this.DbObject = new Db(this.Client, this.DbName);
        this.mongoDbInit = this.initiateMongoDB();
        this.Blockchain = new Blockchain();
        // this.Collection_IsoCoin = this.DbObj.collection("Iso_Coin");

    }

    async initiateMongoDB(): Promise<string> {

        try {
            // Use connect method to connect to the server
            await this.Client.connect();
            console.log("Server'a bağlandı. ");

            let dbobj = this.Client.db(this.DbName);

            let CollectionArr = [{
                colName: "blocks",
                colDocCount: await dbobj.collection("blocks").countDocuments(),
                schema: blockDocs

            },
            {
                colName: "chainstate",
                colDocCount: await dbobj.collection("chainstate").countDocuments(),
                schema:chainstateDocs
            }]

            //console.log(JSON.stringify(CollectionArr))

            for(const index of CollectionArr){

                if (index.colDocCount === 0) {
                    await dbobj.createCollection(index.colName, index.schema);
                    console.log(index.colName+" oluşturuldu");
                }
                else {
                    console.log("Bu tablo zaten var.");
    
                }
            }
           

            // this.mongoDbObjs(dbobj); 
            this.Client.close();


        } catch (error) {
            console.log(error);
        }
        return resolve("Server ayağa kaldırıldı.");
    }

    // mongoDbObjs(_dbObj:Db){
    //     // this.DbObject = _dbObj;
    // }

    async addMongo(colName:string, _addObj: any) {
        let addObj = this.DbObject;
        const addResult = await addObj.collection(colName).insertOne(_addObj);
    }

    async updateMongo(colName:string, _updateFilter: any, _updateObj: any) {
        let updateObj = this.DbObject;
        const updateResult = await updateObj.collection(colName).updateOne(_updateFilter, _updateObj);
        // const updateResult2 = await this.Collection_IsoCoin.updateOne(_updateFilter,_updateObj);
    }

    async deleteMongo(colName:string, _deleteObj: any) {
        let deleteObj = this.DbObject;
        const deleteResult = await deleteObj.collection(colName).deleteOne(_deleteObj);
        // const deleteResult = await this.Collection_IsoCoin.deleteOne(_deleteObj);
    }



}

let Iso_MongoService = new MongoService();
Iso_MongoService.Blockchain.addBlock({ amount: 150 });

console.log(JSON.stringify(Iso_MongoService.Blockchain, null, 4));

let block_Hash = Iso_MongoService.Blockchain.Blocks[1].Hash;
let Lastblock_Hash = Iso_MongoService.Blockchain.Blocks[Iso_MongoService.Blockchain.Blocks.length - 1].PrevBlockHash;

let _addObj_blocks = {
    b: block_Hash,
    l: Lastblock_Hash
}
let _addObj_chainstate = {
    c: block_Hash,
    B: Lastblock_Hash
}

Iso_MongoService.addMongo("blocks",_addObj_blocks);
//Iso_MongoService.addMongo("_addObj_chainstate",_addObj2);


