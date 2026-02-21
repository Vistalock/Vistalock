import axios from 'axios';

async function main() {
    try {
        const res = await axios.post('https://vistalock-api.onrender.com/auth/login', {
            email: 'testagent10000@gmail.com',
            password: 'Password123' // Guessing a password, but we mostly just want to see if it hits the endpoint or 404s
        });
        console.log('Success:', res.data);
    } catch (error: any) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
    }
}

main().catch(console.error);
