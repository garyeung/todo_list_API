import User from "../models/User.interface"
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "../models/jwt.interface";
import { config } from "dotenv";

config();

const SECRET = process.env.JIW_SECRET || 'secret';

export function tokenGenerate(user:User){
    const payload: JwtPayload = {
            id:user.id!,
            email: user.email
    }

    return jwt.sign(payload, SECRET, {expiresIn: '1h'}); 
}

export async function tokenVerify(req:Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(" ")[1];

    if(!token){
        res.status(401).json({message: "Unauthorized"});
        return;
    }

    try {
        
        const decoded = jwt.verify(token, SECRET) as {id: number, email: string};

        req.user = {id: decoded.id, email: decoded.email};

        next();

    } catch (error) {
        console.error("Token verification error: ", error)
        res.status(401).json({message: "Unauthorized"});
        return;
        
    }

}