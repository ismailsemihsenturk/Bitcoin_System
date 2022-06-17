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
var block_1 = require("../block");
var mongodb_1 = require("mongodb");
var path_1 = require("path");
var blockDocs = require("./mongoDocs/blocks.json");
var chainstateDocs = require("./mongoDocs/chainstate.json");
//import blockDocs from "./mongoDocs/blocks.json";
var MongoService = /** @class */ (function () {
    function MongoService() {
        this.DbName = "BlockChain_System";
        this.C_Blocks_Prop = blockDocs.validator.$jsonSchema.properties;
        this.Client = new mongodb_1.MongoClient("mongodb://localhost:27017");
        this.DbObject = new mongodb_1.Db(this.Client, this.DbName);
        this.mongoDbInit = this.initiateMongoDB();
        this.Blockchain = new block_1.Blockchain();
        // this.Collection_IsoCoin = this.DbObj.collection("Iso_Coin");
    }
    MongoService.prototype.initiateMongoDB = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbobj, CollectionArr, _a, _i, CollectionArr_1, index, error_1;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        // Use connect method to connect to the server
                        return [4 /*yield*/, this.Client.connect()];
                    case 1:
                        // Use connect method to connect to the server
                        _d.sent();
                        console.log("Server'a bağlandı. ");
                        dbobj = this.Client.db(this.DbName);
                        _b = {
                            colName: "blocks"
                        };
                        return [4 /*yield*/, dbobj.collection("blocks").countDocuments()];
                    case 2:
                        _a = [(_b.colDocCount = _d.sent(),
                                _b.schema = blockDocs,
                                _b)];
                        _c = {
                            colName: "chainstate"
                        };
                        return [4 /*yield*/, dbobj.collection("chainstate").countDocuments()];
                    case 3:
                        CollectionArr = _a.concat([(_c.colDocCount = _d.sent(),
                                _c.schema = chainstateDocs,
                                _c)]);
                        console.log(JSON.stringify(CollectionArr));
                        _i = 0, CollectionArr_1 = CollectionArr;
                        _d.label = 4;
                    case 4:
                        if (!(_i < CollectionArr_1.length)) return [3 /*break*/, 8];
                        index = CollectionArr_1[_i];
                        if (!(index.colDocCount === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, dbobj.createCollection(index.colName, index.schema)];
                    case 5:
                        _d.sent();
                        console.log(index.colName + " oluşturuldu");
                        return [3 /*break*/, 7];
                    case 6:
                        console.log("Bu tablo zaten var.");
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 4];
                    case 8:
                        // this.mongoDbObjs(dbobj); 
                        this.Client.close();
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _d.sent();
                        console.log(error_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/, (0, path_1.resolve)("Server ayağa kaldırıldı.")];
                }
            });
        });
    };
    // mongoDbObjs(_dbObj:Db){
    //     // this.DbObject = _dbObj;
    // }
    MongoService.prototype.addMongo = function (colName, _addObj) {
        return __awaiter(this, void 0, void 0, function () {
            var addObj, addResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addObj = this.DbObject;
                        return [4 /*yield*/, addObj.collection(colName).insertOne(_addObj)];
                    case 1:
                        addResult = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoService.prototype.updateMongo = function (colName, _updateFilter, _updateObj) {
        return __awaiter(this, void 0, void 0, function () {
            var updateObj, updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateObj = this.DbObject;
                        return [4 /*yield*/, updateObj.collection(colName).updateOne(_updateFilter, _updateObj)];
                    case 1:
                        updateResult = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoService.prototype.deleteMongo = function (colName, _deleteObj) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteObj, deleteResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deleteObj = this.DbObject;
                        return [4 /*yield*/, deleteObj.collection(colName).deleteOne(_deleteObj)];
                    case 1:
                        deleteResult = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return MongoService;
}());
var Iso_MongoService = new MongoService();
Iso_MongoService.Blockchain.addBlock({ amount: 150 });
console.log(JSON.stringify(Iso_MongoService.Blockchain, null, 4));
var block_Hash = Iso_MongoService.Blockchain.Blocks[1].Hash;
var Lastblock_Hash = Iso_MongoService.Blockchain.Blocks[Iso_MongoService.Blockchain.Blocks.length - 1].PrevBlockHash;
var _addObj_blocks = {
    b: block_Hash,
    l: Lastblock_Hash
};
var _addObj_chainstate = {
    c: block_Hash,
    B: Lastblock_Hash
};
Iso_MongoService.addMongo("blocks", _addObj_blocks);
//Iso_MongoService.addMongo("_addObj_chainstate",_addObj2);
