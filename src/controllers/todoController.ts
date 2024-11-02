import {Request, Response } from "express";
import Todo from "../models/Todo.interface.";
import TodoServer from "../services/todoServer";


const todoDB = new TodoServer();

export async function createTodo(req: Request, res: Response) {
    const {title, description}:{title: string, description: string} = req.body;

    if(!title || !description) {
        res.status(400).json({error: "The title and description are required"});
        return;
    }

    try {
        const todo:Todo = await todoDB.create({
            title,
            description
        },req.user!.id)

        res.status(201).json({id: todo.id, title: todo.title, description: todo.description});

    }catch (error){
        console.error('Error creating todo:', error);
        res.status(500).json({ message: "Failed to create to-do item." });
    }

}

export  async function updateTodo(req:Request, res: Response) {
    const id = parseInt(req.params.id);
    const {title, description} = req.body;

    if(!title || !description) {
        res.status(400).json({error: "The title and description are required"});
        return;
    }

    try{
        const todo = await todoDB.findOne(id);

        if(!todo){
            res.status(404).json({error: "todo not found"});
            return;
        }

        if(todo.userID !== req.user!.id){
            res.status(403).json({
                "message": "Forbidden"
            })
            return;
        }

        await todoDB.update(id,{
            title,
            description
        })

        res.status(200).json({
            id,
            title,
            description
        })
    }
    catch(error){
        console.error('Error updating todo:', error);
        res.status(500).json({ message: "Failed to update to-do item." });
    }
    
}

export async function deleteTodo(req: Request, res: Response) {

        try {
           const id = parseInt(req.params.id);

            const todo = await todoDB.findOne(id);
    
            if(!todo){
                res.status(404).json({error: "todo not found"});
                return;
            }
    
            if(todo.userID !== req.user!.id){
                res.status(403).json({
                    "message": "Forbidden"
                })
                return;
            }

            const deleted = await todoDB.delete(id);
            if(deleted){
                res.status(204).send();
            }
            
        } catch (error) {
            console.error('Error deleting todo:', error);
            res.status(500).json({ message: "Failed to delete to-do item." });
                
        }
}

export async function getTodoList(req: Request, res: Response) {
   const page = parseInt(req.query.page as string) || 1;
   const limit = parseInt(req.query.limit as string) || 10;

   try {
        const todoList = await todoDB.findMany(
                req.user!.id,
                page,
                limit)

        if(!todoList || todoList.length === 0){
            res.status(404).json({
                message: "Todo List not founded"
            });
            return;
        }

        res.status(200).json({
            data: todoList,
            page,
            limit,
            total: todoList.length
        })
    
   } catch (error) {
        console.error('Error fetching todo list:', error);
        res.status(500).json({ message: "Failed to fetch to-do list." });
   }
}