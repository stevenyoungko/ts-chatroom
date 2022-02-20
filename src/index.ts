import devServer from "./server/dev";
import prodServer from "./server/prod";
import express from "express";
import { Server, Socket } from 'socket.io'
import http from 'http'

import { name } from "@/utils";

const port = 3000;
const app = express();
const server = http.createServer(app)
const io = new Server(server)


// 監測連接
io.on('connection', (socket) => {
  // 發射 welcome訊息到 join頻道
  socket.emit('join', 'welcome1')
  socket.emit('join', 'welcome2')
  socket.emit('join', 'welcome3')
})

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

console.log("server side", name);

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});
