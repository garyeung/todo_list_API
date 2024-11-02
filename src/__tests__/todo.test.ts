import { config } from "dotenv";
import express from 'express';
import todoRouter from "../routes/todoRouter";
import {afterAll, beforeAll, describe, expect, test} from '@jest/globals';
import request from "supertest";
import userRouter from "../routes/userRouter";
import User from "../models/User.interface";
import Todo from "../models/Todo.interface.";

config();
const testServer = express();
testServer.use(express.json());
testServer.use('/users', userRouter);
testServer.use("/todos", todoRouter);

describe("Todo Manipulation Tests", () => {
    let token: string;
    let user: User = {
        name: "Tester2",
        email: "tester2@test.com",
        password: 'testpassword'
    }
    let todo: Todo = {
        title: "Testing to buy groceries",
        description: "Buy test1, test2, and test3"
    }
    let updatedTodo: Todo  = {
        title: "Testing to update groceries",
        description: "Buy test4, test5, and test6"

    }

    beforeAll(async () => {
       // create user get the token
      const response = await request(testServer)
          .post('/users/register')
          .send(user);

        expect(response.status).toBe(201);
        token = response.body.token;
    })

    afterAll(async () => {
        // clean user
       const response  = await request(testServer)
                               .delete(`/users/delete/${user.email}`)
                               .set("Authorization", `Bearer ${token}`)
                               ;
        expect(response.status).toBe(204);


    })

    // create a todo 
    test("Create a Todo", async () => {
        const response = await request(testServer)
                                .post("/todos")
                                .send(todo)
                                .set("Authorization", `Bearer ${token}`);
                        
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        todo.id = response.body.id;
    })

    // update a todo
    test("Update a Todo", async () => {
        const response = await request(testServer).put(`/todos/${todo.id!}`).send(updatedTodo)
                                .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updatedTodo.title);
        updatedTodo.id = response.body.id;
    })

    // get todo list
    test("Get a todo list", async () => {
        const response = await request(testServer)
                                .get("/todos?page= 1&limit=10")
                                .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("data");
        expect(response.body.total).toBe(1);
    });

    // delete a todo
    test("Delete a todo", async ()=> {
        const response = await request(testServer)
                                .delete(`/todos/${updatedTodo.id}`)
                                .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(204);
    });
});