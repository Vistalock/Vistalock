const axios = require('axios');

async function register() {
    try {
        console.log('Registering simple admin...');
        const res = await axios.post('http://localhost:3000/auth/register', {
            email: 'superadmin_simple@vistalock.com',
            password: 'AdminPass123!',
            role: 'SUPER_ADMIN'
        });
        console.log('Register Success!', res.data);
    } catch (error) {
        console.error('Register Failed', error.response ? error.response.data : error.message);
    }
}
register();
