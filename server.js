const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser , userLeave , getRoomUser} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const BotName = 'Love Bot';

const port = 3000 || process.env.PORT;
//set Static Folder in order to user elements of the folder with their name.
const PublicDirectory = path.join(__dirname, './public');
app.use(express.static(PublicDirectory));

//run when client connects
io.on('connection', socket=>{

   socket.on('joinRoom', ({username , room})=>{
      const user = userJoin(socket.id , username , room);
      socket.join(user.room);
      socket.emit('message', formatMessage(BotName ,'welcome to HS-Chat'));

      // Broadcast when a user connects
      socket.broadcast.to(user.room).emit('message' ,formatMessage(BotName ,`${user.username} has joined the Chat`));

      //send users and room info
      io.to(user.room).emit('roomUsers', {
         room:user.room,
         users:getRoomUser(user.room)
      });

   });

   //Listen for chat message
   socket.on('chatMessage', msg=>{
      const user = getCurrentUser(socket.id);
      io.to(user.room).emit('message',formatMessage(user.username, msg));
   })

     //Runs when Client Dissconnect;
     socket.on('disconnect', ()=>{
      const user = userLeave(socket.id);
      if(user){
         io.to(user.room).emit('message' , formatMessage('user' ,`${user.username} has left the Chat`));
      }
      io.to(user.room).emit('roomUsers', {
         room:user.room,
         users:getRoomUser(user.room)
      });
   });

});



server.listen(port , ()=>console.log(`Server running on port  http://localhost:${port}`));
