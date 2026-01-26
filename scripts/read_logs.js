const fs = require('fs');
const content = fs.readFileSync('auth_debug_500.log', 'utf8');
const lines = content.split('\n');
lines.forEach(line => {
    if (line.includes('Error') || line.includes('login') || line.includes('UsersService') || line.includes('fail') || line.includes('Attempting') || line.includes('Prisma')) {
        console.log(line);
    }
});
