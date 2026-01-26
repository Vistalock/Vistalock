import { Role } from '@vistalock/database';

console.log('Role Enum Keys:', Object.keys(Role));
console.log('Does MERCHANT_AGENT exist?', 'MERCHANT_AGENT' in Role);
