"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MongoService = void 0;
var block_1 = require("../block");
var mongodb_1 = require("mongodb");
var crypto_js_1 = require("crypto-js");
var blockDocs = require("./mongoDocs/blocks.json");
var chainstateDocs = require("./mongoDocs/chainstate.json");
//import blockDocs from "./mongoDocs/blocks.json";
var MongoService = /** @class */ (function () {
    function MongoService() {
        this.DbName = "BlockChain_System";
        this.C_Blocks_Prop = blockDocs.validator.$jsonSchema.properties;
        this.Client = new mongodb_1.MongoClient("mongodb://localhost:27017");
        this.DbObject = new mongodb_1.Db(this.Client, this.DbName);
        // this.Collection_IsoCoin = this.DbObj.collection("Iso_Coin");
    }
    MongoService.prototype.initiateMongoDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var block_exist, block_docs, dbobj, CollectionArr, _a, listCol, _i, CollectionArr_1, index, blockStructure, addBlocktoStructure, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        block_exist = false;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 15, , 16]);
                        // Use connect method to connect to the server
                        return [4 /*yield*/, this.Client.connect()];
                    case 2:
                        // Use connect method to connect to the server
                        _d.sent();
                        console.log("Server'a bağlandı. ");
                        dbobj = this.Client.db(this.DbName);
                        _b = {
                            colName: "blocks",
                            schema: blockDocs
                        };
                        return [4 /*yield*/, dbobj.collection("blocks").distinct('_id')];
                    case 3:
                        _a = [(_b.colCount = (_d.sent()).length,
                                _b)];
                        _c = {
                            colName: "chainstate",
                            schema: chainstateDocs
                        };
                        return [4 /*yield*/, dbobj.collection("chainstate").distinct('_id')];
                    case 4:
                        CollectionArr = _a.concat([(_c.colCount = (_d.sent()).length,
                                _c)]);
                        return [4 /*yield*/, dbobj.listCollections().toArray()];
                    case 5:
                        listCol = (_d.sent()).map(function (n) { return n.name; });
                        _i = 0, CollectionArr_1 = CollectionArr;
                        _d.label = 6;
                    case 6:
                        if (!(_i < CollectionArr_1.length)) return [3 /*break*/, 10];
                        index = CollectionArr_1[_i];
                        if (!!listCol.includes(index.colName)) return [3 /*break*/, 8];
                        return [4 /*yield*/, dbobj.createCollection(index.colName, index.schema)];
                    case 7:
                        _d.sent();
                        console.log(index.colName + " oluşturuldu");
                        return [3 /*break*/, 9];
                    case 8:
                        console.log(index.colName + " isimli tablo zaten var.");
                        if (index.colName === "blocks" && index.colCount !== 0) {
                            block_exist = true;
                        }
                        console.log(block_exist);
                        _d.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 6];
                    case 10: return [4 /*yield*/, dbobj.collection("chainstate").find().toArray()];
                    case 11:
                        HashObj = _d.sent();
                        HashStr = JSON.stringify(HashObj[HashObj.length - 1].Hash);
                        if (!block_exist) return [3 /*break*/, 13];
                        return [4 /*yield*/, dbobj.collection("blocks").find().toArray()];
                    case 12:
                        block_docs = _d.sent();
                        blockStructure = block_docs;
                        addBlocktoStructure = [];
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
                        blockStructure.push(addBlocktoStructure[0]);
                        return [2 /*return*/, blockStructure];
                    case 13:
                        console.log("genesis'e geldi");
                        this.Client.close();
                        return [2 /*return*/, [{
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
                                }]];
                    case 14:
                        this.Client.close();
                        return [3 /*break*/, 16];
                    case 15:
                        error_1 = _d.sent();
                        console.log(error_1);
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/, [{
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
                            }]];
                }
            });
        });
    };
    MongoService.prototype.addMongo_Blocks = function (_Blocksize, _Blockheader, _Transaction_counter, _transactions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        colBlocks[colBlocks.length - 1]._id = new mongodb_1.ObjectId();
                        colBlocks[colBlocks.length - 1].Blocksize = _Blocksize;
                        colBlocks[colBlocks.length - 1].Blockheader = _Blockheader;
                        colBlocks[colBlocks.length - 1].Transaction_counter = _Transaction_counter;
                        colBlocks[colBlocks.length - 1].transactions = _transactions;
                        return [4 /*yield*/, this.DbObject.collection("blocks").insertOne(colBlocks[colBlocks.length - 1])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoService.prototype.addMongo_Chainstate = function (_prevHash, _hash) {
        return __awaiter(this, void 0, void 0, function () {
            var addObj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addObj = {
                            _id: new mongodb_1.ObjectId(),
                            prevHash: _prevHash,
                            Hash: _hash
                        };
                        console.log("prev mongo: " + addObj.prevHash);
                        return [4 /*yield*/, this.DbObject.collection("chainstate").insertOne(addObj)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoService.prototype.getHash = function () {
        return HashStr;
    };
    return MongoService;
}());
exports.MongoService = MongoService;
// -------------VARIABLES-------------
var MyWallet;
var Wallet_Arr;
var Iso_MongoService;
var BlockChainInstance;
var TxInstance = [];
var In_TxInstance = [(new block_1.TxInput(-1, -1, "Coinbase Tx"))];
var Out_TxInstance = [(new block_1.TxOutput(100000, "Miner Public Key"))];
var HashObj;
var HashStr;
var colBlocks = [{
        _id: new mongodb_1.ObjectId(),
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
    var TxHash = (0, crypto_js_1.SHA256)(JSON.stringify(In_TxInstance[0]) + JSON.stringify(Out_TxInstance[0])).toString();
    TxInstance.push(new block_1.Transaction([TxHash], In_TxInstance, Out_TxInstance));
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Iso_MongoService = new MongoService();
                    MyWallet = new block_1.Wallet();
                    return [4 /*yield*/, MyWallet.WalletInstance()];
                case 1:
                    Wallet_Arr = _a.sent(); //Wallet_Arr[0].PRIVATE_KEY
                    return [2 /*return*/];
            }
        });
    });
}
main();
