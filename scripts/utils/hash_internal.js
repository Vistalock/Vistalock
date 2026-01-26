const bcrypt = require('bcrypt');
console.log(bcrypt.hashSync('AdminPass123!', 10));
