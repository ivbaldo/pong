'use strict';

const port = process.env.PORT || 5000;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public/'));

const server = app.listen( port, () => {
    console.log(`Juego PONG Multijugador en en el puerto ${port}`);
    
});

//Creamos un servidor de juegos tipo WebSocket

const socket = require('socket.io');
const io = socket( server );

io.sockets.on('connect', onConnect);

var connections = [];

var currentState = {
    players: [{}, {}],
    ball: {}
};

function onConnect( socket){
    connections.push(socket.id);
    console.log('onConnect');

    if(connections.length > 2){
        console.error('onConnect: Demasiados jugadores conectados');
        return;
    }

    socket.on('start', onStart);
    socket.on('updatePlayer', onUpdatePlayer);
    socket.on('updateBall', onUpdateBall);

    //Enviar el estado actual del juego a los jugadores
    setInterval(heartBeat, 33);
}
function onUpdatePlayer( state ){
    //buscamos al jugador por su socket.id y lo actualizamos
    for(let i=0, found=false; i<currentState.players.length && !found; i++){
        if(currentState.players[i].id == state.id){
            found = true;
            currentState.players[i].y = state.y;
            currentState.players[i].score = state.score;
        };
        
    };
}
function onUpdateBall( state ){
    currentState.ball.x = state.x;
    currentState.ball.y = state.y;
    currentState.ball.speed = state.speed;
    currentState.ball.velocityX = state.velocityX;
    currentState.ball.velocityY = state.velocityY;
    
}

function onStart( state ){
    console.log('onStart');
    //Puntero al estado del jugador que acaba de hacer la llamada on start
    const index = connections[0]===state.id ? 0 : 1;
    const csp = currentState.players[index];
    csp.id = state.id;
    csp.y = state.y;
    csp.width = state.width;
    csp.height = state.height;
    csp.score = state.score;

    console.log('Estamos en la funcion onStart:', csp);
    //equivalente a currentState.players[index].id = state.id
}

//Envio el estado a todo el mundo
function heartBeat(){
    io.socket.emit('heartBeat', currentState);
}
// app.listen(port, () => {
//     console.log(`Juego PONG en http://localhost:${port}`);
// });







