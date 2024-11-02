import { config } from "dotenv";
import express from 'express';
import userRouter from "../routes/userRouter";
import {describe, expect, test} from '@jest/globals';
import supertest from 'supertest';
import User from "../models/User.interface";

config();
const testServer = express();
testServer.use(express.json());
testServer.use('/users', userRouter);

// register
// input name, email, password
// if success receive a token
//then use the email register again, expect 400 
describe("User Authentication Tests", () =>{
    let user: User = {
        name: "Tester",
        email: "tester@test.com",
        password: 'testpassword'
    }

    test("Register a new user", async () => {
        const response = await supertest(testServer)
        .post("/users/register")
        .send(user);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');

    });

    test("Register with an existing email", async ()=> {
        const response = await supertest(testServer)
        .post("/users/register")
        .send(user);
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error");
    });

// login
// input email, wrong password
//  expect 401

   test("Login with wrong password", async ()=>{
    const response= await supertest(testServer).post("/users/login")
                .send({
                    email: user.email,
                    password: "123"
                });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error");
   })

   test('Login with correct password', async () => {
        const response = await supertest(testServer)
            .post('/users/login')
            .send({
                email: user.email,
                password: user.password 
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token'); // Expect token on successful login
    });


    test(`Delete user`, async ()=> {
        const LoginResponse = await supertest(testServer)
            .post('/users/login')
            .send({
                email: user.email,
                password: user.password 
            }).expect(200);

       const authToken = LoginResponse.body.token; //get the token

       const response  = await supertest(testServer)
                               .delete(`/users/delete/${user.email}`)
                               .set("Authorization", `Bearer ${authToken}`);
        expect(response.status).toBe(204);
    })
});
