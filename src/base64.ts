'use strict';

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

class InvalidCharacterError extends Error {
  name: string;
  message: string;
  constructor(message: string) {
    super(message)
    this.name = 'InvalidCharacterError';
    this.message = message;
  }
}

// encoder
export function btoa2(input: string) {
  let data = String(input), o1, o2, o3, bits, i = 0, acc = '';

  while (i < data.length) {
    // pack three octets into four hextets
    o1 = data.charCodeAt(i++);
    o2 = data.charCodeAt(i++);
    o3 = data.charCodeAt(i++);

    if (o1 > 255 || o2 > 255 || o3 > 255) {
      throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }

    bits = (o1 << 16) | (o2 << 8) | o3;
    // use hextets to index into b64, and append result to encoded string
    acc += chars.charAt((bits >> 18) & 0x3F) +
      chars.charAt((bits >> 12) & 0x3F) +
      chars.charAt((bits >> 6) & 0x3F) +
      chars.charAt((bits) & 0x3F);
  }

  switch (data.length % 3) {
    case 0: return acc;
    case 1: return acc.slice(0, -2) + '==';
    case 2: return acc.slice(0, -1) + '=';
  }
}

// decoder
// [https://gist.github.com/1020396] by [https://github.com/atk]
export function atob2(input: string) {
  let str = (String(input)).replace(/[=]+$/, ''); // #31: ExtendScript bad parse of /=
  if (str.length % 4 === 1) {
    throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  let output = '';
  for (
    // initialize result and counters
    let bc = 0, bs = 0, buffer, idx = 0;
    // get next character
    buffer = str.charAt(idx++); // eslint-disable-line no-cond-assign
    // character found in table? initialize bit storage and add its ascii value;
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf(buffer);
  }
  return output;
}