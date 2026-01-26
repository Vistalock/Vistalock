// Quick test to verify backend connection
import axios from 'axios';

const testConnection = async () => {
    console.log('Testing backend connection...');

    // Test 1: Android Emulator
    try {
        const res1 = await axios.get('http://10.0.2.2:3001');
        console.log('✅ Android Emulator (10.0.2.2:3001) - Connected!');
    } catch (e: any) {
        console.log('❌ Android Emulator (10.0.2.2:3001) - Failed:', e.message);
    }

    // Test 2: Local IP
    try {
        const res2 = await axios.get('http://192.168.100.45:3001');
        console.log('✅ Local IP (192.168.100.45:3001) - Connected!');
    } catch (e: any) {
        console.log('❌ Local IP (192.168.100.45:3001) - Failed:', e.message);
    }

    // Test 3: Localhost
    try {
        const res3 = await axios.get('http://localhost:3001');
        console.log('✅ Localhost (localhost:3001) - Connected!');
    } catch (e: any) {
        console.log('❌ Localhost (localhost:3001) - Failed:', e.message);
    }
};

testConnection();
