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
// import * as blockDocs from "./mongoDocs/blocks.json";
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
            var dbobj, collections, collectionNames, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        // Use connect method to connect to the server
                        return [4 /*yield*/, this.Client.connect()];
                    case 1:
                        // Use connect method to connect to the server
                        _b.sent();
                        console.log("Server'a bağlandı. ");
                        dbobj = this.Client.db(this.DbName);
                        return [4 /*yield*/, this.Client.db().listCollections().toArray()];
                    case 2:
                        collections = _b.sent();
                        collectionNames = collections.map(function (c) { return c.name; });
                        if (!!collectionNames.includes("blocks")) return [3 /*break*/, 4];
                        _a = this;
                        return [4 /*yield*/, dbobj.createCollection("blocks", blockDocs)];
                    case 3:
                        _a.Collection_Blocks = _b.sent();
                        console.log("Tablo oluşturuldu");
                        return [3 /*break*/, 5];
                    case 4:
                        console.log("Bu tablo zaten var.");
                        _b.label = 5;
                    case 5:
                        this.mongoDbObjs(dbobj);
                        this.Client.close();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _b.sent();
                        console.log(error_1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, (0, path_1.resolve)("Server ayağa kaldırıldı.")];
                }
            });
        });
    };
    MongoService.prototype.mongoDbObjs = function (_dbObj) {
        // this.DbObject = _dbObj;
    };
    MongoService.prototype.addMongo = function (_addObj) {
        return __awaiter(this, void 0, void 0, function () {
            var addObj, addResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addObj = this.DbObject;
                        return [4 /*yield*/, addObj.collection("blocks").insertOne(_addObj)];
                    case 1:
                        addResult = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoService.prototype.updateMongo = function (_updateFilter, _updateObj) {
        return __awaiter(this, void 0, void 0, function () {
            var updateObj, updateResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateObj = this.DbObject;
                        return [4 /*yield*/, updateObj.collection("blocks").updateOne(_updateFilter, _updateObj)];
                    case 1:
                        updateResult = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MongoService.prototype.deleteMongo = function (_deleteObj) {
        return __awaiter(this, void 0, void 0, function () {
            var deleteObj, deleteResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deleteObj = this.DbObject;
                        return [4 /*yield*/, deleteObj.collection("blocks").deleteOne(_deleteObj)];
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
var _addObj = {
    b: block_Hash,
    l: Lastblock_Hash
};
Iso_MongoService.addMongo(_addObj);
