const crypto = require('crypto');
const constants = require('./constants');
const JCryption = require('./libs/jcryption');

const gtbKEY = constants.GTB.ENCKEY;
const ubaKEY = constants.UBA.ENCKEY;


function gtbEncryptor(unencryptedtext) { 
    try {
        var encryptedtext = crypto.publicEncrypt(
          {
              key: gtbKEY,
              padding: crypto.constants.RSA_PKCS1_PADDING
          }, 
          Buffer.from(unencryptedtext,'utf8')
        );
        
        return encryptedtext.toString('base64')
    } catch (e) {
        console.log(e);
        return "";
    }
}

async function ubaEncryptor(data, jskey) {
    try {
        let encryptionExponent = jskey.split(",")[0];
        let modulus = jskey.split(",")[1];
        let maxDigits = jskey.split(",")[2];
        let encryptor = new JCryption();
        let keypair = await encryptor.getCryptionKeyPair(encryptionExponent,modulus, maxDigits);

        
        let encryptedtext = {val:null};
        await encryptor.startEncryption(keypair, data).then((encrypteddata) => {
            encryptedtext.val = encrypteddata;
        });
        return encryptedtext.val;
    } catch (e) {
        console.log(e);
        return null;
    }
}

module.exports = {
    encryptGTBData: gtbEncryptor,
    encryptUBAData: ubaEncryptor
}