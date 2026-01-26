const bcrypt = require('bcryptjs');
const pass = 'MerchantPass123!';
console.log(`Hashing: '${pass}'`);
bcrypt.hash(pass, 10).then(h => console.log(h));
