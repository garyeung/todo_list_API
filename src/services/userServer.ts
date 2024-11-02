import { USERS_TABLE, DB_TABLE } from "../models/DB.interface";
import User from "../models/User.interface";
import connectDB from "./connectDB";

class UserServer {
    private db: {
        any: (text: string, params: any[]) => Promise<any[]>;
        oneOrNone: (text: string, params: any[]) => Promise<any>;
        none: (text: string, params: any[]) => Promise<null>;
        one: (text: string, params: any[]) => Promise<any>;
    } | null;
    private initPromise: Promise<void> | null;

    constructor() {
        this.db = null;
        this.initPromise = null;
    }

    private async ensureInitialized() {
        if (!this.db && !this.initPromise) {
            this.initPromise = this.initial();
        }
        await this.initPromise;
    }

    private async initial() {
        this.db = await connectDB();
    }

    public async find(userEmail: string): Promise<User|null> {
        try {
            await this.ensureInitialized();

            const found = await this.db!.oneOrNone(`
                SELECT * FROM ${DB_TABLE.USERS}
                WHERE ${USERS_TABLE.EMAIL} = $1
            `, [userEmail]);

            if (found) {

              return {
                  id: Number.parseInt(found[USERS_TABLE.USERID]),
                  name: found[USERS_TABLE.NAME],
                  email: found[USERS_TABLE.EMAIL],
                  password: found[USERS_TABLE.PW],
              };
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    public async create(user: User): Promise<User> {
        try {
            await this.ensureInitialized();

            const result = await this.db!.one(`
                INSERT INTO ${DB_TABLE.USERS}
                (${USERS_TABLE.NAME}, ${USERS_TABLE.EMAIL}, ${USERS_TABLE.PW}) 
                VALUES($1, $2, $3) 
                RETURNING *
            `, [user.name, user.email, user.password]);

            return {
                id: Number.parseInt(result[USERS_TABLE.USERID]),
                name: result[USERS_TABLE.NAME],
                email: result[USERS_TABLE.EMAIL],
                password: result[USERS_TABLE.PW],
            };
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    public async delete(email: string){
        try {
            await this.ensureInitialized();
            const found = await this.find(email);
            if(found){
                await this.db!.any(`DELETE FROM ${DB_TABLE.USERS} WHERE ${USERS_TABLE.EMAIL} = $1`, [email])
                const foundAgain = await this.find(email);
                if(!foundAgain){
                    console.log(`user ${found.name} with ${found.email} has been deleted successfully`)
                    return true;
                }
            }
            console.error(`Couldn't find email: ${email}`);
            return false;

            
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
            
        }
    }
}

export default UserServer;