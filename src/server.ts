import { config } from "dotenv";
import express from 'express'
import userRouter from "./routes/userRouter";
import todoRouter from "./routes/todoRouter";
config();


const PORT = process.env.PORT || 3000;
const server = express();

server.use(express.json());

server.use("/users", userRouter);
server.use("/todos", todoRouter);

server.listen(PORT, ()=> {
    console.log(`Server is running on http://localhost:${PORT}`)
})