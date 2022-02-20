import "./index.css";
import { io } from 'socket.io-client'
import { name } from "@/utils";

console.log("client side chatroom page", name);


// 1.建立連接 -> node server
const clientIo = io()
clientIo.on('join', msg => {
  console.log(msg)
})