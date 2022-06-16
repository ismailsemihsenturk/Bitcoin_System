"use strict";
exports.__esModule = true;
exports.Block = exports.Blockchain = void 0;
var sha256JS = require("crypto-js/sha256.js"); // import CryptoJS = require('./index'); şeklinde atama yapıldığı için * as x şeklinde import etmek gerek.
// import {EC} from "elliptic/lib/elliptic/ec/index.js" ecma5 ile yazıldığı için export {EC} değil module.exports = EC bu yüzden require ile atama gerekiyor.
// Yukarıdakilerin çalışması için type defination lazım olursa npm i @types/elliptic --save-dev şeklinde @types'ları indirmek gerek. 
var EC = require("elliptic/lib/elliptic/ec/index.js");
var SHA256 = sha256JS;
var ec = new EC("secp256k1");
var Block = /** @class */ (function () {
    function Block(_timestamp, _data, _prevBlockHash) {
        this.Data = [];
        this.PrevBlockHash = "";
        this.Hash = this.setHash();
        this.Timestamp = _timestamp;
        this.Data = _data;
        this.PrevBlockHash = _prevBlockHash;
        this.Hash = this.setHash();
        this.Nonce = 0;
    }
    Block.prototype.setHash = function () {
        return SHA256(this.Timestamp + JSON.stringify(this.Data) + this.PrevBlockHash + this.Nonce).toString();
    };
    Block.prototype.mineBlock = function (difficulty) {
        while (this.Hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.Nonce++;
            this.Hash = this.setHash();
        }
        console.log("Nonce: " + this.Nonce + "\n" + "Block mined: " + this.Hash);
    };
    return Block;
}());
exports.Block = Block;
var Blockchain = /** @class */ (function () {
    function Blockchain() {
        this.Blocks = [this.createGenesisBlock()];
    }
    Blockchain.prototype.createGenesisBlock = function () {
        return new Block(Date.now(), {}, "genesis");
    };
    Blockchain.prototype.addBlock = function (_data) {
        var prevBlock = this.Blocks[this.Blocks.length - 1];
        var newBlock = new Block(Date.now(), _data, prevBlock.Hash);
        this.Blocks.push(newBlock);
    };
    return Blockchain;
}());
exports.Blockchain = Blockchain;
