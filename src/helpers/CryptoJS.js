var CryptoJS = require("crypto-js");
const secretKey = 'business-listing-project-secret-key-for-basic-for-auth';

// Decrypts encrypted data using the secret key
const decrypt = async(data) => {
    const bytes = await CryptoJS.AES.decrypt(data, secretKey);
    const decryptedJSONString = await bytes.toString(CryptoJS.enc.Utf8);
    const deData = await JSON.parse(decryptedJSONString);
    return deData;
}

// Encrypts data using the secret key
const encrypt = async (data) => {
    return await CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

module.exports = {
    decrypt,
    encrypt
}