//Declaraciones
const FONT_COLOR = 'WHITE';
const FONT_SIZE = "45px";
const FONT_FAMILY = 'impact';

const BG_COLOR = 'BLACK';

const NUM_BALLS = 5;

const FRAME_PER_SECOND = 50;
const COMPUTER_LEVEL = 0.1;

const PADDLE_RIGHT_COLOR = 'WHITE';
const PADDLE_LEFT_COLOR = 'RED';
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;

const NET_COLOR = 'WHITE';
const NET_WIDTH = 4;
const NET_HEIGHT = 10;
const NET_PADDING = 15;

const BALL_COLOR = 'WHITE';
const BALL_RADIUS = 10;
const BALL_DELTA_VELOCITY = 0.5;
const BALL_VELOCIDAD = 5;

//Recuperamos el canvas
const cvs = document.getElementById('pong_canvas');
const ctx = cvs.getContext('2d');

//Definimos los objetos del juego
const playerA = {
    x: 0,
    y: cvs.height/2-PADDLE_HEIGHT/2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PADDLE_LEFT_COLOR,
    score: 0
}
const playerB = {
    x: cvs.width-PADDLE_WIDTH,
    y: cvs.height/2-PADDLE_HEIGHT/2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    color: PADDLE_RIGHT_COLOR,
    score: 0
}

const ball = {
    x: cvs.width/2,
    y: cvs.height/2,
    radius: BALL_RADIUS,
    speed: BALL_VELOCIDAD,
    velocityX: BALL_VELOCIDAD,
    velocityY: BALL_VELOCIDAD,
    color: BALL_COLOR
}

const net = {
    x: cvs.width/2 - NET_WIDTH/2,
    y: 0,
    width: NET_WIDTH,
    height: NET_HEIGHT,
    padding: NET_PADDING,
    color: NET_COLOR
}

//Declarar los jugadores
var localPlayer;
var computer;

localPlayer = playerA;
computer = playerB;

//HELPERS

function drawRect(x,y,w,h,color){

    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    
}

function drawCircle(x,y,w,h,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,w,0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    
}

function drawText(text, x,y,color=FONT_COLOR, fontSize=FONT_SIZE, fontFamily=FONT_FAMILY){
    ctx.fillStyle = color;
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.fillText(text, x, y);
    
}

//HELPERS básicos del pong
function clearCanvas(){
    drawRect(0,0, cvs.width, cvs.height, BG_COLOR);
}

function drawNet(){
    for(let i = 0; i<cvs.height; i+=NET_PADDING){
        drawRect(net.x, net.y+i, net.width, net.height, net.color);
    }
}

function drawScore(){
    drawText(localPlayer.score, 1*(cvs.width/4), cvs.height/6);
    drawText(computer.score, 3*(cvs.width/4), cvs.height/6);
}

function drawPaddle(paddle){
    drawRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
}

function drawBall(){
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

//HELPERS del juego ---------------------------------------------
function initPaddleMovement(){
    cvs.addEventListener('mousemove', updateLocalPlayerPos);
}

function updateLocalPlayerPos(event){
    const rect = cvs.getBoundingClientRect();
    localPlayer.y = event.clientY - localPlayer.height/2 - rect.top;
}
function pause(ms){
    stopGameLoop();
    setTimeout(() => {
        initGameLoop();
    }, ms);
}
function newBall(){
    ball.x = cvs.width/2;
    ball.y = cvs.height/2;
    const direction = ball.velocityX > 0 ? -1: 1;
    ball.velocityX = direction * BALL_VELOCIDAD;
    ball.velocityY = BALL_VELOCIDAD;
    ball.speed = BALL_VELOCIDAD;

    pause(500);
}
function collision(b, p){
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;

    return b.right > p.left && b.bottom > p.top && b.left < p.right && b.top < p.bottom;
}

function updateComputer(){
    computer.y += (ball.y - (computer.y + computer.height/2))* COMPUTER_LEVEL;        
}

function update(){
    //Actulaizar la pelota
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    //Si la bola golpea los laterales del campo
    if(ball.y+ball.radius > cvs.height || ball.y-ball.radius < 0){
        //corregimos la velocidad del eje y
        ball.velocityY = -ball.velocityY;
    }

    //Actualizamos nuestra IA
    updateComputer();

    //verificamos si la pelota golpea en la pala
    let whatPlayer = (ball.x < cvs.width/2) ? playerA : playerB;

    if(collision(ball, whatPlayer)){
        //Calcular donde golpea la pelota en la pala
        let collaidePoint = ball.y - (whatPlayer.y + whatPlayer.height/2);

        // Normalizamos 
        collaidePoint = collaidePoint/ (whatPlayer.height/2);

        // Calculamos el angulo en radianes
        const angleRad = collaidePoint * Math.PI/4;

        //Calculamos la nueva direccion en el eje X
        const direccion = (ball.x < cvs.width/2) ? 1 : -1;

        //Modificamos la velocidad de la pelota
        ball.velocityX = direccion * ball.speed * Math.cos(angleRad);
        ball.velocityY =             ball.speed * Math.sin(angleRad);

        // Cada vez que golpeamos en la pala incrementamos la velocidad

        ball.speed += BALL_DELTA_VELOCITY;
    }
    //Actualizar el marcador
    if(ball.x-ball.radius < 0){
        computer.score++;
        newBall();

    } else if(ball.x + ball.radius > cvs.width){
        localPlayer.score++;
        newBall();
    } 
}



function render(){
    clearCanvas();
    
    drawNet();
    drawScore();
    
    drawPaddle(localPlayer);
    drawPaddle(computer);   
    //Si ha terminado la partida...
    if(isGameOver()){
        endGame();
    }else{

        drawBall();
    }

}
function isGameOver(){
    return localPlayer.score >= NUM_BALLS || computer.score >= NUM_BALLS;
}
function endGame(){
    console.log("Game over");

    //Mostramos el mensaje del juego
    drawText('GAME OVER', cvs.width/3, cvs.height/2, 'BLUE');

    stopGameLoop();
}

function loopGame(){
    update();
    render();
}

var gameLoopId;
function stopGameLoop(){
    clearInterval(gameLoopId);
}

function initGameLoop(){
    gameLoopId = setInterval(loopGame, 1000/FRAME_PER_SECOND);
}

function play(){
    initPaddleMovement();
    initGameLoop();
}
//inicio el juego
play();