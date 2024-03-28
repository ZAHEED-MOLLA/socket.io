import express from "express";
import { Server } from "socket.io";
import {createServer} from "http";
import cors  from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);

const io = new Server(server,{
    cors:{
      origin: "http://localhost:5173",
      methods: ["GET","POST"], 
      credentials: true,
    },
});
 const secretKeyJWT = "hellohello";

app.use(cors())

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.get("/login",(req,res)=>{
 const token =   jwt.sign({_id:"zaheedhossainmolla"},secretKeyJWT)
 res
 .cookie("token",token,{httpOnly: true,secure: true, sameSite:"none"})
 .json({
    message: "Login Success",
 });
});

const user = false;

io.use((socket,next)=>{
    cookieParser()(socket.request,socket.request.res,(err)=>{
        if(err) return next(err);

        const token = socket.request.cookies.token;

        if(!token) return next(new Error("Authentication Error"));

        const decode = jwt.verify(token,secretKeyJWT);
        next();
    });
});

io.on("connection",(socket)=>{
   console.log("User Connected",socket.id);
//    console.log("ID",socket.id);

socket.on("message",({room,message})=>{
    console.log({room,message})
    // io.emit("receive-message",data);
    // socket.broadcast.emit("receive-message",data)
    io.to(room).emit("receive-message",message)
})

socket.on("join-room",(room)=>{
    socket.join(room);
})

   socket.on("disconnect",()=>{
    console.log("User Disconnected",socket.id);
   })
//    socket.emit("welcome",`Welcome to the server`)
//    socket.broadcast.emit("welcome",`${socket.id} joined the server`)
});

const PORT = 3000;

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})