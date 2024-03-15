const { func } = require('joi');

require('dotenv').config();

let connection = connectDB()

async function connectDB() {
    //Connection Validation 
    if (global.connection)
        return global.connection.connect();

    const { Pool } = require('pg');
    const pool = new Pool({
        connectionString: process.env.CONNECTION_STRING
    });

    //Test
    const client = await pool.connect();
    console.log("PostGreSQL Connected!");

    global.connection = pool;

    //Transfer Connect
    connection = client

    return client;
}

async function setupDatabase() {
    let query = `SELECT COUNT(*) AS table_count FROM pg_catalog.pg_tables WHERE tablename = 'servers';`

    const checkTable = await connection.query(query)

    const tableCount = checkTable.rows[0].table_count

    if (tableCount === '0') {
        query = `CREATE TABLE servers (
            id serial NOT NULL PRIMARY KEY,
            name text COLLATE pg_catalog."default" NOT NULL,
            hostname text COLLATE pg_catalog."default" NOT NULL,
            monitoring_uri text COLLATE pg_catalog."default" NOT NULL,
            monitoring_ping boolean NOT NULL,
            monitoring_http boolean NOT NULL,
            healthstatus_ping text,
            healthstatus_http text
        );`

        await connection.query(query)
        console.log("Creating tables")
    }

    return checkTable
}


module.exports= { connectDB, connection, setupDatabase }