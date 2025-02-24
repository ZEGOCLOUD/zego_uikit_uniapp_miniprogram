/* eslint-disable no-cond-assign */
import CryptoJS from "crypto-js";
import * as base64 from "./base64"

/**
 * Generate token
 *
 * Token = "04" + Base64.encode(expire_time + IV.length + IV + binary ciphertext.length + binary ciphertext)
 * Algorithm: AES<ServerSecret, IV>(token_json_str), use mode: CBC/PKCS5Padding
 *
 * Only the client-side sample code for generating token is provided here. Be sure to generate tokens in your business background to avoid leaking your ServerSecret
 */
export function generatePrebuiltTokenTest(
    appID: number,
    serverSecret: string,
    userID: string,
    seconds?: number
) {
    if (!userID) {
        console.error("【ZEGOCLOUD】:userID required!!");
        return "";
    }
    if (!appID) {
        console.error("【ZEGOCLOUD】:appID required!!");
        return "";
    }

    if (typeof appID != "number") {
        console.error("【ZEGOCLOUD】:appID must be number!!");
        return "";
    }

    if (!serverSecret) {
        console.error("【ZEGOCLOUD】: serverSecret required!!");
        return "";
    }

    // construct encrypted data
    const time = (Date.now() / 1000) | 0;
    const body = {
        app_id: appID,
        user_id: userID,
        nonce: (Math.random() * 2147483647) | 0,
        ctime: time,
        expire: time + (seconds || 7200),
    };
    // encrypt body
    const key = CryptoJS.enc.Utf8.parse(serverSecret);
    let iv = Math.random().toString().substring(2, 18);
    if (iv.length < 16) iv += iv.substring(0, 16 - iv.length);

    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(body), key, {
        iv: CryptoJS.enc.Utf8.parse(iv),
    }).toString();
    const ciphert = Uint8Array.from(
        Array.from(base64.atob2(ciphertext)).map((val) => val.charCodeAt(0))
    );
    const len_ciphert = ciphert.length;

    // Assemble token data
    const uint8 = new Uint8Array(8 + 2 + 16 + 2 + len_ciphert);
    // expire: 8
    uint8.set([0, 0, 0, 0]);
    uint8.set(new Uint8Array(Int32Array.from([body.expire]).buffer).reverse(), 4);
    // iv length: 2
    uint8[8] = iv.length >> 8;
    uint8[9] = iv.length - (uint8[8] << 8);
    // iv: 16
    uint8.set(
        Uint8Array.from(Array.from(iv).map((val) => val.charCodeAt(0))),
        10
    );
    // ciphertext length: 2
    uint8[26] = len_ciphert >> 8;
    uint8[27] = len_ciphert - (uint8[26] << 8);
    // ciphertext
    uint8.set(ciphert, 28);

    const token = `04${base64.btoa2(String.fromCharCode(...Array.from(uint8)))}`;
    return token
}


