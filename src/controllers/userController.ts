import e, { Request, Response } from "express";
import UserServer from "../services/userServer";
import { hashingPW, comparePW } from "../services/hash.service";
import { tokenGenerate } from "../services/token.service";

const userDB = new UserServer();

export async function register(req: Request, res: Response) {
   const {name, email, password}:{
    name: string,
    email: string,
    password: string
   }  = req.body;

   // find user email in database if found do something
   // otherwise create user 
   const exsitingUser = await userDB.find(email);

   if(exsitingUser){
     res.status(400).json({"error": "Email already exists"})
     return;
   }

   try {
        const hashedPW = await hashingPW(password);

        const user =  await userDB.create({
            name,
            email,
            password: hashedPW
        })

        const token = tokenGenerate(user);

        res.status(201).json({token});
    
   } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({error: 'Failed to register user'});
   }
}

export async function login(req: Request, res: Response) {
   const {email, password}: {email: string, password: string} = req.body;
   // check request email whether in database
   // compare request password and database password
   // if success generate token and response token
   // else
   //  response error

   try {
       const user = await userDB.find(email);

       if(!user){
            res.status(400).json({error: "Invalid email"});
            return;
       }

       const isMatch = await comparePW(password, user.password);

       if(!isMatch){
          res.status(401).json({error: "Password incorrect."});
          return;
       }

       const token = tokenGenerate(user);
       res.status(200).json({token});
    
   } catch (error) {
        console.error('Login error:', error);    
        res.status(500).json({error: 'Failed to login'});
   }

}

export async function deleteUser(req:Request<{email:string}>,res:Response) {
     const {email} = req.params;

     try{
          const existingUser = await userDB.find(email);

          if(!existingUser){
               res.status(404).json({error: "User not found"});
               return;
          }
          const deleted = await userDB.delete(email);

          if(deleted){
               res.status(204).send();
               return;
          }

     }catch(error){
          console.error('Delete user error:', error);
          res.status(500).json({ error: 'Failed to delete user' });
     }

     
}