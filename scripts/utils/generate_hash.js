const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('AdminPass123!', 10));
