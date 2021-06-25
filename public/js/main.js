const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')


// Get username and room form URL

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
// console.log(username,room);
// script tag added in html so can use socket in this folder
const socket = io();


// Join chat room
socket.emit('joinRoom',{username,room})


// Get room and users
socket.on('roomUsers',({
  room,users
})=>{
  outputRoomName(room)
  outputUsers(users)

})


// message form servers
socket.on("message", (message) => {
  //   console.log(message);

  outputMessage(message);
  //   Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // get message text
  const msg = e.target.elements.msg.value;
  // Emit message to server
  socket.emit("chatMessage", msg);
  //   clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

  document.querySelector(".chat-messages").appendChild(div);
}


// add room name to dom
function outputRoomName (room){
  roomName.innerText = room
}

// add users to DOM
function outputUsers(users){
  userList.innerHTML = `${users.map(user=>
    `<li>${user.username}</li>`
  ).join('')}`
}