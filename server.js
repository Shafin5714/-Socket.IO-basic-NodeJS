const express = require("express");
const path = require("path");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");

// needed to use socket.io
const http = require("http");
const app = express();
const socketio = require("socket.io");

const server = http.createServer(app);

const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Run when a client connects
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    // console.log("New WS Connection....");

    const user = userJoin(socket.id, username, room);

    //  join a room
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects (emit to everybody except the use that is connecting)
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage("USER", `${user.username} has joined the chat `)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMsg
  socket.on("chatMessage", (msg) => {
    // console.log(msg);

    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      // send user and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
