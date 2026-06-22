import { decryptIfEncrypted, decrypt } from './src/lib/crypto.js';
console.log(decryptIfEncrypted('ESCROW:PAYMENT_HELD:held||8X9X'));
console.log(decrypt('ESCROW:PAYMENT_HELD:held||8X9X'));
