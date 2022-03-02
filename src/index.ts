import devServer from "@/server/dev";
import prodServer from "@/server/prod";
import express from "express";
import { Server, Socket } from 'socket.io'
import http from 'http'
import UserService from "@/service/UserService"
import moment from 'moment'

import { name } from "@/utils";

const port = 3000;
const app = express();
const server = http.createServer(app)
const io = new Server(server)
const userService = new UserService()


// 監測連接
io.on('connection', (socket) => {
  socket.emit('userID', socket.id)

  // 加入聊天室
  socket.on('join', ({ userName, roomName }: { userName: string, roomName: string }) => {
    const userData = userService.userDataHandler(
      socket.id,
      userName,
      roomName
    )

    socket.join(userData.roomName)

    userService.addUser(userData)
    // broadcast 自己看不到自己的訊息
    socket.broadcast.to(userData.roomName).emit('join', `${userName} 加入了 ${roomName} 聊天室`)
  })

  socket.on('chat', (msg) => {
    const time = moment.utc()
    const userData = userService.getUser(socket.id)
    if (userData) {
      io.to(userData.roomName).emit('chat', { userData, msg, time })
    }
  })

  // 離開聊天室
  socket.on('disconnect', () => {
    const userData = userService.getUser(socket.id)
    const userName = userData?.userName
    if (userName) {
      socket.broadcast.to(userData.roomName).emit('leave', `${userName}離開 ${userData.roomName} 聊天室!`)
    }
    userService.removeUser(socket.id)
  })
})

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});
