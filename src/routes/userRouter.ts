import express from 'express';
import { login, register, deleteUser } from '../controllers/userController';
import { tokenVerify } from '../services/token.service';

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/register", register);
userRouter.delete("/delete/:email", tokenVerify,deleteUser);

export default userRouter;