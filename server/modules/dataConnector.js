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

async function setupDatabase(){

    let query = `SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE tablename = 'servers';`

    const checkTable = await connection.query(query)

    if (checkTable.rows === 0) {
        query = `CREATE TABLE servers (
            id serial NOT NULL PRIMARY KEY,
            name text COLLATE pg_catalog."default" NOT NULL,
            hostname text COLLATE pg_catalog."default" NOT NULL,
            monitoring_url text COLLATE pg_catalog."default" NOT NULL,
            monitoring_ping boolean NOT NULL,
            monitoring_http boolean NOT NULL,
            healthstatus_ping boolean,
            healthstatus_http boolean,
            healthstatus_https boolean
          );`
    
        const returnDB = await connection.query(query)
        console.log("Creating tables")
    }

    return
}

module.exports= { connectDB, connection, setupDatabase }