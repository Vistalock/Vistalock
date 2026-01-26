const bcrypt = require('bcryptjs');

const password = 'AgentPass123!';
const hash = '$2b$10$rLKzdikYoDBPaW7tx7lYtuSXIyrj.Pa83ggajxJDGqTiyzdMwtCaWa';

bcrypt.compare(password, hash).then(result => {
    console.log('Password matches:', result);
    if (!result) {
        console.log('Hash verification FAILED - generating new hash');
        bcrypt.hash(password, 10).then(newHash => {
            console.log('New working hash:', newHash);
        });
    } else {
        console.log('✅ Hash is correct!');
    }
});
