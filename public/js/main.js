
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
//Get username and room from URL
const {username , room} = Qs.parse(location.search , {
   ignoreQueryPrefix : true
})

const socket =io.connect('https://hsjchat.vercel.app/');

//join chat room
socket.emit('joinRoom', {username , room});

//get room and user
socket.on('roomUsers', ({room , users})=>{
   outPutRoomName(room);
   outPutUsers(users);
})

socket.on('message', message => {
   console.log(message);
   outPutMessage(message);
   chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message Submit
chatForm.addEventListener('submit', (e) => {
   e.preventDefault();
   //Get msg text
   const msg = e.target.elements.msg.value;
   //Emit msg to server
   socket.emit('chatMessage', msg);
   //clear input
   e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outPutMessage(message) {
   const div = document.createElement('div');
   div.classList.add('message');
   div.innerHTML = `<p class="meta">${message.username}
   <span>${message.time}</span></p>
<p class="text">
  ${message.text}
</p>`
document.querySelector('.chat-messages').appendChild(div);
}

//Add room name to DOM
function outPutRoomName(room){
   roomName.innerText = room
}

//Add users to DOM
function outPutUsers(users){
   userList.innerHTML = `
   ${users.map(user=>`<li>${user.username}</li>`).join('')}
   `;
}