const bcrypt = require('bcryptjs');

const password = 'MerchantPass123!';
const hash = '$2b$10$rC8Al6NI6EKtwac/aSXMMe227APhq.PH.LuCDXXddGQWiDqCxWYpsW';

bcrypt.compare(password, hash).then(result => {
    console.log('Password matches:', result);
    if (!result) {
        console.log('Hash verification FAILED');
        // Generate a new hash
        bcrypt.hash(password, 10).then(newHash => {
            console.log('New hash:', newHash);
        });
    }
});
