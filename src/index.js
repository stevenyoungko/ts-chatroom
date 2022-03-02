const express  = require("express") 
const path = require("path")
const socket = require('socket.io') 
const http = require('http') 
const UserService = require("../src/service/UserService")
const moment =  require('moment')
const app = express();
const server = http.createServer(app)
const io = new socket.Server(server)
const userService = new UserService()


// 監測連接
io.on('connection', (socket) => {
  socket.emit('userID', socket.id)

  // 加入聊天室
  socket.on('join', ({ userName, roomName }) => {
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
  app.use(express.static("dist"))
  app.get("/", function (req, res, next) {
    res.sendFile(path.join(__dirname, '../dist/main/main.html'));
  });
}

server.listen(process.env.PORT || 3000, () => {
  console.log(`The application is running.`);
})
