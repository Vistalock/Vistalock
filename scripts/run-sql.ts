
import { Client } from 'pg';
import * as fs from 'fs';

const client = new Client({
    connectionString: 'postgresql://user:secret123@127.0.0.1:5433/vistalock_local'
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to DB');

        const sql = fs.readFileSync('add_role.sql', 'utf8');
        await client.query(sql);
        console.log('✅ Successfully added MERCHANT_AGENT role!');
    } catch (e: any) {
        if (e.code === '42710') { // duplicate object error
            console.log('✅ Role already exists (duplicate error ignored).');
        } else {
            console.error('Error executing SQL:', e);
            process.exit(1);
        }
    } finally {
        await client.end();
    }
}

main();
