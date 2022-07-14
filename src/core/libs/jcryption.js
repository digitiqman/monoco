var jsprecisionmaths = require('./precisionmaths');
const pauser = require('deasync');

class JCryption {

    constructor() {
        this.options = {
            collectionSpeed: 1,
            encryptionSpeed: 1
        };

        this.kp = {};
        this.encryptdata = "";

    };

    async getCryptionKeyPair(encryptionExponent, modulus, maxdigits) {
        jsprecisionmaths.setMaxDigits(parseInt(maxdigits, 10));
        this.kp.e = jsprecisionmaths.biFromHex(encryptionExponent);
        this.kp.m = jsprecisionmaths.biFromHex(modulus);
        this.kp.chunkSize = 2 * jsprecisionmaths.biHighIndex(this.kp.m);
        this.kp.radix = 16;
        this.kp.barrett = new jsprecisionmaths.BarrettMu(this.kp.m);
        return this.kp;
    };

    async startEncryption(kP, encryptObj) {

        function encryptChar(keyPair, encryptObject, charCounter, block, encrypted, resolve) {
            block = new jsprecisionmaths.BigInt();
            var j = 0;
            for (var k = charCounter; k < charCounter + keyPair.chunkSize; ++j) {
                block.digits[j] = encryptObject[k++];
                block.digits[j] += encryptObject[k++] << 8;
            }
            var crypt = keyPair.barrett.powMod(block, keyPair.e);
            var text = keyPair.radix == 16 ? jsprecisionmaths.biToHex(crypt) : jsprecisionmaths.biToString(crypt, keyPair.radix);
            encrypted += text + " ";
            charCounter += keyPair.chunkSize;
            if (charCounter < encryptObject.length) {
                return new Promise((resolve, reject) => {
                    setTimeout(function () {
                        encryptChar(keyPair, encryptObject, charCounter, block, encrypted,resolve);
                    }, this.options.encryptionSpeed);
                });
            } else {
                console.log("Data is:");
                console.log(encrypted.substring(0, encrypted.length - 1));
                encrypted = encrypted.substring(0, encrypted.length - 1);
                resolve(encrypted);
            }
        }        

        var charSum = 0;
        for (var i = 0; i < encryptObj.length; i++) {
            charSum += encryptObj.charCodeAt(i);
        }
        var tag = '0123456789abcdef';
        var hex = '';
        hex += tag.charAt((charSum & 0xF0) >> 4) + tag.charAt(charSum & 0x0F);

        var taggedString = hex + encryptObj;

        var encrypt = [];
        var j = 0;

        while (j < taggedString.length) {
            encrypt[j] = taggedString.charCodeAt(j);
            j++;
        }

        while (encrypt.length % kP.chunkSize !== 0) {
            encrypt[j++] = 0;
        }

        var charCounter = 0;
        var j, block;
        var encrypted = "";


        return new Promise((resolve, reject) => {
            setTimeout(function () {
                encryptChar(kP, encrypt, charCounter, block, encrypted,resolve);
            }, this.options.encryptionSpeed);
        });
    };
    
};


module.exports = JCryption;
