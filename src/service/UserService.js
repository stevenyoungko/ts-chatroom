module.exports = class UserService {
  // 記錄使用者的資訊
  #userMap

  constructor() {
    this.userMap = new Map()
  }

  addUser(data) {
    this.userMap.set(data.id, data)
  }

  removeUser(id) {
    if (this.userMap.has(id)) {
      this.userMap.delete(id)
    }
  }

  getUser(id) {
    if (!this.userMap.has(id)) return null

    const data = this.userMap.get(id)
    if (data) {
      return data
    }

    return null
  }

  userDataHandler(id, userName, roomName) {
    return {
      id,
      userName,
      roomName
    }
  }
}