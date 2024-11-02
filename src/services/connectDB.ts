import pgPromise from 'pg-promise';
import { DB_TABLE, USERS_TABLE, TODOSTABLE } from '../models/DB.interface';
import { config } from 'dotenv';

config();

const pgp = pgPromise();
const db = pgp(process.env.DATABASE_URL!);
async function connectDB() {

    try {
        // Create users table if it doesn't exist
        await db.none(`
            CREATE TABLE IF NOT EXISTS ${DB_TABLE.USERS} (
                ${USERS_TABLE.USERID} SERIAL PRIMARY KEY,
                ${USERS_TABLE.NAME} VARCHAR(100) NOT NULL,
                ${USERS_TABLE.EMAIL} VARCHAR(100) UNIQUE NOT NULL,
                ${USERS_TABLE.PW} VARCHAR(255) NOT NULL
            )
        `);
        // Create todo_lists table if it doesn't exist
        await db.none(`
            CREATE TABLE IF NOT EXISTS ${DB_TABLE.TODOLISTS} (
                ${TODOSTABLE.ID} SERIAL PRIMARY KEY,
                ${TODOSTABLE.TITLE} VARCHAR(100) NOT NULL,
                ${TODOSTABLE.DESCRIPT} TEXT,
                ${TODOSTABLE.USERID} INTEGER REFERENCES ${DB_TABLE.USERS}(${USERS_TABLE.USERID}),
                ${TODOSTABLE.CREATEDATE} TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ${TODOSTABLE.UPDATEDATE} TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database initialized successfully');
        return {
            any: (text: string, params: any[]) => db.any(text, params),
            oneOrNone: (text: string, params: any[]) => db.oneOrNone(text, params),
            none: (text: string, params: any[]) => db.none(text, params),
            one: (text: string, params: any[]) => db.one(text, params),
            // Add more methods as needed
        };
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }


    // Return an object that Express can use
}

export default connectDB;