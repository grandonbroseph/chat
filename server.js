const express = require("express")
const app     = express()
const server  = require("http").Server(app)
const io      = require("socket.io")(server)
const path    = require("path")
const getHash = require("./get-hash")()
const src     = "docs"

app.use(express.static(path.join(__dirname, src)))
app.get("/", (req, res) => {
  res.send(__dirname + src + "/index.html")
})

function getClient(hash, me) {
  var user = users[hash]
  var client = {
    name: user.name,
    hash: hash,
    me: !!me
  }
  return client
}

var users = {}
var hashes = []
io.on("connection", (socket) => {
  var index = hashes.length
  var hash = getHash(hashes)
  var name = "guest"
  var user = {
    socket: socket,
    name: name
  }
  var clients = []
  for (var key in users) clients.push(getClient(key))
  users[hash] = user
  socket.broadcast.emit("addData", getClient(hash))    // Let other clients know about me
  socket.emit("addData", getClient(hash, true))        // Let me know about myself (?)
  if (clients.length) socket.emit("addDatas", clients) // Let me know about other client.
  socket.on("message", (data) => {
    console.log(`! ${socket.id}: ${data.text}`)
    io.emit("message", data)
  })
  socket.on("disconnect", () => {
    socket.broadcast.emit("removeData", hash)
    delete users[hash]
    hashes.splice(index, 1)
    console.log(`- ${socket.id}`)
  })
  console.log(`+ ${socket.id}: ${hash}`)
})

server.listen(8080, () => {
  console.log("Server started at `localhost:8080`")
})
