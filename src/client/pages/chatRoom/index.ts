import "./index.css";
import { io } from 'socket.io-client'
import { Client } from "socket.io/dist/client";
import { UserData } from "@/service/UserService"; 

type UserMsg = { userData: UserData, msg: string, time: number }

const url = new URL(location.href)
const userName = url.searchParams.get('user_name')
const roomName = url.searchParams.get('room_name')

if (!userName && !roomName) {
  location.href = '/main/main.html'
}

// 1.建立連接 -> node server
const clientIo = io()


// 加入聊天室的發送
clientIo.emit('join', { userName, roomName })

const textInput = document.getElementById('textInput') as HTMLInputElement
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement
const chatBoard = document.getElementById('chatBoard') as HTMLDivElement
const headerRoomName = document.getElementById('headerRoomName') as HTMLParagraphElement
const backBtn = document.getElementById('backBtn') as HTMLButtonElement

headerRoomName.innerText = roomName || ' - '

let userID = ''

function msgHandler(data: UserMsg) {
  const date = new Date(data.time)
  const time = `${date.getHours()}:${date.getMinutes()}`

  const divBox = document.createElement('div')
  divBox.classList.add('flex', 'mb-4', 'items-end')

  if (data.userData.id === userID) {
    divBox.classList.add('justify-end')
    divBox.innerHTML = `
      <p class="text-xs text-gray-700 mr-4">${time}</p>
      <div>
        <p class="text-xs text-white mb-1 text-right">${data.userData.userName}</p>
        <p class="mx-w-[50%] break-all bg-white px-4 py-2 rounded-bl-full rounded-br-full rounded-tl-full">
          ${data.msg}
        </p>
      </div>
    `
  } else {
    divBox.classList.add('justify-start')
    divBox.innerHTML = `
      <div>
        <p class="text-xs text-gray-700 mb-1">${data.userData.userName}</p>
        <p class="mx-w-[50%] break-all bg-gray-800 px-4 py-2 rounded-tr-full rounded-br-full rounded-tl-full text-white">
        ${data.msg}
        </p>
      </div>
      <p class="text-xs text-gray-700 ml-4">${time}</p>
    `
  }

  chatBoard.appendChild(divBox)
  textInput.value = ''
  chatBoard.scrollTop = chatBoard.scrollHeight
}

function rommMsgHandler(msg: string) {
  const divBox = document.createElement('div')
  divBox.classList.add('flex', 'justify-center', 'mb-4', 'center-end')
  divBox.innerHTML = `
    <p class="text-gray-700 text-sm">${msg}</p>
  `
  chatBoard.appendChild(divBox)
  chatBoard.scrollTop = chatBoard.scrollHeight
}

submitBtn.addEventListener('click', () => {
  const textValue = textInput.value
  // chat event
  clientIo.emit('chat', textValue)
})

backBtn.addEventListener('click', () => {
  location.href = '/main/main.html'
})

clientIo.on('join', msg => {
  rommMsgHandler(msg)
})

clientIo.on('chat', (data: UserMsg ) => {
  msgHandler(data)
})

clientIo.on('leave', (msg) => {
  rommMsgHandler(msg)
})

clientIo.on('userID', (id) => {
  userID = id
})