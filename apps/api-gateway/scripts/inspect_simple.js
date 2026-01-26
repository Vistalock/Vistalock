const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    port: 5433,
    user: 'user',
    password: 'secret123',
    database: 'vistalock_local',
});

async function inspect() {
    try {
        await client.connect();

        const res = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `);

        console.log('--- COLUMNS ---');
        res.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type} (Nullable: ${row.is_nullable})`);
        });

        await client.end();
    } catch (e) {
        console.error(e);
    }
}

inspect();
