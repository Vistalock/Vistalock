const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login with superadmin@vistalock.com...');
        const res = await axios.post('http://localhost:3000/auth/login', {
            email: 'superadmin@vistalock.com',
            password: 'AdminPass123!'
        });
        console.log('Login Success!');
        console.log('Status:', res.status);
        console.log('Role:', res.data.role);
        console.log('Token matches:', !!res.data.access_token);
    } catch (error) {
        console.error('Login Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testLogin();
