var socket = io()

var input = document.querySelector("#input")
var vm = new Vue({
  el: "#wrap",
  data: {
    me: null,
    users: [],
    messages: [],
    modal: null
  },
  methods: {
    getUserByHash: function (hash) {
      var userData, userIndex = this.getUserIndexByHash(hash)
      if (userIndex !== -1) {
        userData = this.users[userIndex]
        return userData
      } else {
        return null
      }
    },
    getUserIndexByHash: function (hash) {
      var userIndex, found = false
      this.users.some(function (user, index) {
        if (user.hash === hash) {
          userIndex = index
          found = true
          return found
        }
      })
      if (found) {
        return userIndex
      } else {
        return -1
      }
    },
    submit: function () {
      input = document.querySelector("#input")
      message = {
        text: input.value,
        hash: this.me.hash,
        time: Date.now()
      }
      input.value = ""
      requestAnimationFrame(function () {
        var messages = document.querySelector(".messages")
        messages.scrollTop = messages.scrollHeight - messages.clientHeight;
      })
      socket.emit("message", message)
    },
    addMessage: function (data) {
      var message = {
        text: data.text,
        user: this.getUserByHash(data.hash),
        time: data.time
      }
      this.messages.push(message)
    },
    addData: function (data) {
      if (data.me) {
        this.me = data
      }
      this.users.push(data)
    },
    addDatas: function (datas) {
      datas.some(this.addData)
    },
    removeData: function (hash) {
      this.users.splice(this.getUserIndexByHash(hash), 1)
    },
    removeDatas: function (hash) {
      datas.some(this.removeData)
    }
  },
  mounted: function () {
    var that = this
    socket.on("addData", that.addData)
    socket.on("addDatas", that.addDatas)
    socket.on("removeData", that.removeData)
    socket.on("removeDatas", that.removeDatas)
    socket.on("message", that.addMessage)
  },
  components: {
    user: {
      template: "#user-template",
      props: ["user"]
    }
  }
})
