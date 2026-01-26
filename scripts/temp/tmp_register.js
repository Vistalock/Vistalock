const axios = require('axios');

async function register() {
    try {
        console.log('Registering superadmin_final...');
        const res = await axios.post('http://localhost:3000/auth/register', {
            email: 'superadmin_final@vistalock.com',
            password: 'SuperAdminPass123!',
            role: 'SUPER_ADMIN'
        });
        console.log('Register Success!', res.data);
    } catch (error) {
        console.error('Register Failed', error.response ? error.response.data : error.message);
    }
}
register();
