import express from 'express';
import {Server as WebSocketServer} from 'socket.io';
import http from 'http';
import {v4 as uuid} from 'uuid';

let notes = [];

const app = express();
const server = http.createServer(app);
const io = new WebSocketServer(server);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
   console.log('Nueva Conexion: ', socket.id);

   // Carga todas las Notas
   socket.emit('server:loadnotes', notes);

   // Agrega una nueva Nota con ID
   socket.on('client:newnote', newNote => {
      const note = {...newNote, id: uuid()};
      notes.push(note);
      io.emit('server:newnote', note);
   });

   // Elimina las Notas
   socket.on('client:deletenote', noteId => {
      notes = notes.filter((note) => note.id !== noteId);
      io.emit('server:loadnotes', notes);
   });

   // Obtenemos la Nota a Actualizar
   socket.on('client:getnote', nodeId => {
      const note = notes.find(note => note.id === nodeId);
      socket.emit('server:selectednote', note);
   });

   // Actualizamos una Nota
   socket.on('client:updatenote', updatedNote => {
      notes = notes.map(note => {
         if (note.id === updatedNote.id) {
            note.title = updatedNote.title
            note.description = updatedNote.description
         }
         return note;
      });
      io.emit('server:loadnotes', notes);
   });

});

server.listen(3000);
console.log('Server on Port', 3000);