import Router from 'express';
import { createTodo, updateTodo, deleteTodo, getTodoList } from '../controllers/todoController';
import { tokenVerify } from '../services/token.service';

const todoRouter = Router();

todoRouter.post("/", tokenVerify, createTodo);
todoRouter.put("/:id", tokenVerify, updateTodo);
todoRouter.delete("/:id", tokenVerify, deleteTodo);
todoRouter.get("/", tokenVerify, getTodoList);

export default todoRouter;