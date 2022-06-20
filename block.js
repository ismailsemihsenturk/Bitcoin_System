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
exports.TxOutput = exports.TxInput = exports.Transaction = exports.Wallet = exports.Block = exports.Blockchain = void 0;
var sha256JS = require("crypto-js/sha256.js"); // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
var mongoService_1 = require("./mongoDb/mongoService");
require("dotenv/config");
// import * as ECobj from "elliptic/lib/elliptic/ec/index.js";" ecma5 ile yazıldığı için export {EC} değil module.exports = EC bu yüzden require ile atama gerekiyor.
// Yukarıdakilerin çalışması için type defination lazım olursa npm i @types/elliptic --save-dev şeklinde @types'ları indirmek gerek. 
var EC = require("elliptic/lib/elliptic/ec/index");
var SHA256 = sha256JS;
var ec = new EC("secp256k1");
var Block = /** @class */ (function () {
    function Block(_blocksize, _blockheader, _Transaction_counter, _transactions) {
        this.MongoDb_Service = new mongoService_1.MongoService();
        this.Blocksize = _blocksize;
        this.Blockheader = _blockheader;
        this.Transaction_counter = _Transaction_counter;
        this.transactions = _transactions;
        this.Hash = this.setHash(this.Blockheader);
    }
    Block.prototype.setHash = function (_blockheader) {
        var merkleObj = [""];
        for (var i = 0; i < this.transactions.length; i++) {
            merkleObj[i] = this.transactions[i].txID;
        }
        this.Blockheader.merkleRoot = SHA256(JSON.stringify(merkleObj)).toString();
        if (this.Blockheader.prevBlockHash === "ali") {
            this.getHash();
        }
        return SHA256(JSON.stringify(_blockheader)).toString();
    };
    Block.prototype.getHash = function () {
        return __awaiter(this, void 0, void 0, function () {
            var str;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.MongoDb_Service.getHash()];
                    case 1:
                        str = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Block.prototype.mineBlock = function () {
        while (this.Hash.substring(0, this.Blockheader.difficulty) !== Array(this.Blockheader.difficulty + 1).join("0")) {
            this.Blockheader.nonce++;
            this.Hash = this.setHash(this.Blockheader);
        }
        console.log("Nonce: " + this.Blockheader.nonce + "\n" + "Block mined: " + this.Hash);
        this.transactions[this.transactions.length - 1].Vout[0].ScrriptPubKey = String(process.env.PRIVATE_KEY1);
        var blockSizeStr = JSON.stringify(this.Magic_no) + JSON.stringify(this.Blockheader) + JSON.stringify(this.Transaction_counter) + JSON.stringify(this.transactions);
        this.Blocksize = blockSizeStr.length;
        console.log("prev: " + this.Blockheader.prevBlockHash);
        this.MongoDb_Service.addMongo_Blocks(this.Blocksize, this.Blockheader, this.Transaction_counter, this.transactions);
        this.MongoDb_Service.addMongo_Chainstate(this.Blockheader.prevBlockHash, this.Hash);
    };
    return Block;
}());
exports.Block = Block;
var Blockchain = /** @class */ (function () {
    function Blockchain() {
        this.Blocks = [];
        this.Genesis = false;
        this.createGenesisBlock();
    }
    Blockchain.prototype.createGenesisBlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var MongoDb_Service, docs_Blocks, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        MongoDb_Service = new mongoService_1.MongoService();
                        return [4 /*yield*/, MongoDb_Service.initiateMongoDB()];
                    case 1:
                        docs_Blocks = _a.sent();
                        if (docs_Blocks[docs_Blocks.length - 1].Blockheader.prevBlockHash === "genesis") {
                            this.Genesis = true;
                        }
                        for (i = 0; i < docs_Blocks.length; i++) {
                            this.Blocksize = Number(JSON.stringify(docs_Blocks[i].Blocksize));
                            this.Blockheader = JSON.parse(JSON.stringify(docs_Blocks[i].Blockheader));
                            this.Transaction_counter = Number(JSON.stringify(docs_Blocks[i].Transaction_counter));
                            this.transactions = JSON.parse(JSON.stringify(docs_Blocks[i].transactions));
                            this.addObj = [{ Magic_no: "ISO1998", Blocksize: this.Blocksize, Blockheader: this.Blockheader, Transaction_counter: this.Transaction_counter, transactions: this.transactions }];
                            this.addBlock(this.addObj);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Blockchain.prototype.addBlock = function (_addObj) {
        // İlk bloğu minela.
        if (this.Genesis) {
            this.Blocks.push(new Block(_addObj[0].Blocksize, _addObj[0].Blockheader, _addObj[0].Transaction_counter, _addObj[0].transactions));
            // console.log("createGenesisBlock: " + JSON.stringify(this.Blocks[this.Blocks.length - 1], null, 5))
            this.Blocks[this.Blocks.length - 1].mineBlock();
        }
        else { // Node'dakileri ram'e aktar.
            for (var i = 0; i < _addObj.length; i++) {
                this.Blocks.push(new Block(_addObj[i].Blocksize, _addObj[i].Blockheader, _addObj[i].Transaction_counter, _addObj[i].transactions));
            }
            // Ramdekileri aldıktan sonra kendi ekleyeceğin bloğu minela.
            this.Blocks[this.Blocks.length - 1].mineBlock();
        }
    };
    return Blockchain;
}());
exports.Blockchain = Blockchain;
var Wallet = /** @class */ (function () {
    function Wallet() {
        // const key = ec.genKeyPair();
        // this.publicKey = key.getPublic("hex");
        // this.privateKey = key.getPrivate("hex");
    }
    Wallet.prototype.WalletInstance = function () {
        var Wallets = [{
                PRIVATE_KEY: process.env.PRIVATE_KEY1,
                PUBLIC_KEY: process.env.PUBLIC_KEY1
            },
            {
                PRIVATE_KEY: process.env.PRIVATE_KEY2,
                PUBLIC_KEY: process.env.PUBLIC_KEY2
            },
            {
                PRIVATE_KEY: process.env.PRIVATE_KEY3,
                PUBLIC_KEY: process.env.PUBLIC_KEY3
            },
        ];
        return Wallets;
    };
    return Wallet;
}());
exports.Wallet = Wallet;
var Transaction = /** @class */ (function () {
    function Transaction(_id, _vIn, _vOut) {
        this.txID = _id;
        this.Vin = _vIn;
        this.Vout = _vOut;
    }
    return Transaction;
}());
exports.Transaction = Transaction;
var TxInput = /** @class */ (function () {
    function TxInput(_index, _prevTx, _scriptSig) {
        this.Index = _index;
        this.PrevTx = _prevTx;
        this.ScriptSig = _scriptSig;
    }
    return TxInput;
}());
exports.TxInput = TxInput;
var TxOutput = /** @class */ (function () {
    function TxOutput(_value, _scriptPubKey) {
        this.Value = _value;
        this.ScrriptPubKey = _scriptPubKey;
    }
    return TxOutput;
}());
exports.TxOutput = TxOutput;
