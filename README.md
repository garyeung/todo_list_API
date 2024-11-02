# Todo List API 

## Description
(https://roadmap.sh/projects/todo-list-api)  
This is a RESTful API to allow users to manage their to-do list with user authentication. 

## Prerequisites
```sh
install postgretsql
install npm@latest 
```
After creatting your own database, writing your .env file according to the .env.template file

## Installation 
```sh
git clone https://github.com/garyeung/todo_list_API.git

cd todo_list_API 

npm install 
```
## Usage
```sh
npm run dev
npm run build
npm run start
npm run test
```
## Projet Structure
```
/api
  .env: port, jwt_secret, dabaseURL
  /src
    server: load routers, start server 
    /routes
      userRoute: Routing login, register
      todoRoute: Routing CRUD todo with verifytoken

    /controllers
      userController: 
        register: create user in database and return a token
        login: authentication then return a token or not
        delete: delete user

      todoController:
        createTodo
        updateTodo
        deleteTodo
        getTodoList
       
    /models
        jwtPayload.interface
        user.interface
        todo.interface
        dabatase.interface

    /services
        connetctDB: database manipulation
        hash.service:  hashing password and compare passwords
        todoServer: todos table manipulation
        userServer: user table manipulation
        token.service: generate token and verify token

    /__tests__
        todo.test:  todo manipulation test
        user.test:  user manipulation test
    /@types
        express.d: declare request with payload called user

```

