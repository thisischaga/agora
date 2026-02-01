import CryptoJS from 'crypto-js';


export const generateSecrteKey = ()=>{
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.base64);
};

export const encryptData = (data, secretKey)=>{
    return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decryptData = (data, secretKey )=>{

    const bytes = CryptoJS.AES.decrypt(data, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
}; 