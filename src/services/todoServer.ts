import { DB_TABLE, TODOSTABLE, USERS_TABLE } from "../models/DB.interface";
import Todo from "../models/Todo.interface.";
import connectDB from "./connectDB";

class TodoServer{
    private db: { any: (text: string, params: any[]) => Promise<any[]>; oneOrNone: (text: string, params: any[]) => Promise<any>; none: (text: string, params: any[]) => Promise<null>; one: (text: string, params: any[]) => Promise<any>; }| null;
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

    private async initial(){
      this.db =  await connectDB();
    }

    public async findOne(todoId: number) {

        let result:null|Todo = null;

        try {
          await this.ensureInitialized();

           const todo = await this.db!.oneOrNone(`SELECT * FROM ${DB_TABLE.TODOLISTS} WHERE ${TODOSTABLE.ID} = $1`, [todoId]) 

           if(todo){
             result = {
                  id: Number.parseInt(todo[TODOSTABLE.ID]),
                  description: todo[TODOSTABLE.DESCRIPT],
                  title: todo[TODOSTABLE.TITLE],
                  userID: Number.parseInt(todo[TODOSTABLE.USERID])
              }
            }

           return result;

        } catch (error) {
            console.error('Error getting Todo:', error);
            throw error;
            
        }
        
    }

    public async findMany(userID: number, page:number, limit: number) {

        let todoList:Todo[] = [];

        try {
            await this.ensureInitialized();
            const offset = (page -1)* limit;
            const todos = await this.db!.any(`
                SELECT tl.* FROM ${DB_TABLE.TODOLISTS} tl JOIN ${DB_TABLE.USERS} u ON tl.${TODOSTABLE.USERID} = u.${USERS_TABLE.USERID}
                WHERE u.${USERS_TABLE.USERID
                } = $1 
                ORDER BY tl.${TODOSTABLE.CREATEDATE} DESC
                LIMIT $2 OFFSET $3`, 
                [userID, limit, offset]
                );
            if(todos){
              todoList = todos.map((todo) => {return {
                  id: Number.parseInt(todo[TODOSTABLE.ID]),
                  title: todo[TODOSTABLE.TITLE],
                  description: todo[TODOSTABLE.DESCRIPT],
              }})
            }
            return  todoList; 

        } catch (error) {
            console.error('Error getting todo list:', error);
            throw error;
        }
        
    }

    public async create(todo: Todo, userID: number) {


        try {
            await this.ensureInitialized();

            const rely = await this.db!.one(`INSERT INTO ${DB_TABLE.TODOLISTS}(${TODOSTABLE.TITLE}, ${TODOSTABLE.DESCRIPT}, ${TODOSTABLE.USERID}) VALUES($1,$2, $3) RETURNING *`,
                [todo.title, todo.description, userID]
            )

            const result: Todo = {
                id: parseInt(rely[TODOSTABLE.ID]),
                title: rely[TODOSTABLE.TITLE],
                description: rely[TODOSTABLE.DESCRIPT],
                userID: parseInt(rely[TODOSTABLE.USERID])
            } 

            return result;
            
        } catch (error) {
           console.error('Error creating todo:', error);
           throw error;
        }
        
    }

    public async delete(todoId:number):Promise<boolean> {

        try {
            await this.ensureInitialized();
            const found = await this.findOne(todoId);
            if(found){
              await this.db!.any(`DELETE FROM ${DB_TABLE.TODOLISTS} WHERE ${TODOSTABLE.ID} = $1`, [todoId]) 

              const foundAgain = await this.findOne(todoId);
              if(!foundAgain){
                console.log(`Todo item${found.title} with id ${found.id} have been deleted successfully!`)
                return true;
              }

            }
           console.error(`Error removing todo (id: ${todoId})`) 
            return false;

        } catch (error) {
            console.error('Error removing todo: ', error) 
            throw error;
        }
        
    }

    public async update(todoId: number, todo: Todo) {

        await this.ensureInitialized();

        try {
            await this.db!.none(
                `UPDATE ${DB_TABLE.TODOLISTS} SET ${TODOSTABLE.TITLE} = $1, ${TODOSTABLE.DESCRIPT} = $2, ${TODOSTABLE.UPDATEDATE} = CURRENT_TIMESTAMP WHERE ${TODOSTABLE.ID} = $3`,
                [todo.title, todo.description, todoId]
            );

        } catch (error) {
            console.error('Error updating todo:', error);
            throw error;
        }
        
    }
}

export default TodoServer;