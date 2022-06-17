import { ec } from "elliptic";

declare module "./node_modules/crypto-js/sha256.js";
declare module "./node_modules/elliptic/lib/elliptic/ec/index";
declare module "*.json" {
    const value: any;
    export default value;
}