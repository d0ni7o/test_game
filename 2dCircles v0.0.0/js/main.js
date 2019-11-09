var newPlayer;
var newEnemy;

var gameObjects = [];
var activeBullets = [];

var bulletSize = 4;

var gameSize = 512;
var frameNo = 0;
var time = frameNo;

var bulletFix = 0;

var botShotFreq = 53;
var AIteam = 2;

function startGame(){
    gameScreen.start();
    newPlayer = new gameComponent(1, 20, 20, 15, "black", "red", 1);
    gameObjects.push(newPlayer);
    newEnemy = new gameComponent(1, 200, 200, 15, "brown", "blue", 2);
    gameObjects.push(newEnemy);
    document.getElementById('startButton').style.display = 'none';
    runGame();
}

var gameScreen = {
    gameArea : document.createElement('canvas'),
    start : function(){
        this.context = this.gameArea.getContext('2d');
        this.gameArea.width = 1.9*gameSize;
        this.gameArea.height = gameSize;
        document.body.insertBefore(this.gameArea,document.body.childNodes[0]);
        this.gameArea.style.display = 'block';

    },
    clear : function(){
        this.context.clearRect(0, 0, 2*this.gameArea.width, this.gameArea.height);
    }
}

function gameComponent(pid, x, y, radius, color1, color2, team){
    this.pid = pid;
    this.team = team;

    this.radius = radius;

    this.x = x;
    this.y = y;

    this.vx = 0.000;
    this.vy = 0.000;

    this.vxL = 0;
    this.vyL = 0;

    this.ax = 0;
    this.ay =0;

    this.theta = 10;
    this.alpha = this.theta;

    this.thV = 0;

    this.color1 = color1;
    this.color2 = color2;
    this.ctx = gameScreen.context;

    this.controls = [0, 0, 0, 0];

    this.draw = function(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        this.ctx.closePath();
        this.ctx.fillStyle = this.color1;
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.lineWidth = this.radius/10;
        this.ctx.lineCap = "round";
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(this.x + this.radius*Math.sin(Math.PI/3 + Math.PI*this.theta/180), this.y + this.radius*Math.cos(Math.PI/3 + Math.PI*this.theta/180));
        this.ctx.lineTo(this.x + this.radius*Math.sin(Math.PI*this.theta/180), this.y + this.radius*Math.cos(Math.PI*this.theta/180));
        this.ctx.lineTo(this.x + this.radius*Math.sin(-Math.PI/3 + Math.PI*this.theta/180), this.y + this.radius*Math.cos(-Math.PI/3 + Math.PI*this.theta/180));
        this.ctx.lineTo(this.x, this.y);
        this.ctx.lineTo(this.x + this.radius*Math.sin(Math.PI*this.theta/180), this.y + this.radius*Math.cos(Math.PI*this.theta/180));
        this.ctx.closePath();
        this.ctx.strokeStyle = this.color2;
        this.ctx.stroke();
    }

    this.newPos = function(){

        if(pid == 1){
            this.vx /= 1.02;
            this.vy /= 1.02;

            this.vxL /= 1.02;
            this.vyL /= 1.02;

            this.ax /= 2;
            this.ay /= 2;

            this.vxL += this.ax;
            this.vyL += this.ay;
    
            this.thV /= 1.1;
    
            this.theta += this.thV;
        }

        this.x += this.vx*Math.sin(Math.PI*this.theta/180) + this.vxL*Math.sin(Math.PI*this.alpha/180);
        this.y += this.vy*Math.cos(Math.PI*this.theta/180) + this.vyL*Math.cos(Math.PI*this.alpha/180);
    }

    this.cMove = function(){
        this.theta += 30*(this.controls[0] - this.controls[1]);

        this.vx += this.controls[2];
        this.vy += this.controls[2];

        this.vx -= this.controls[3];
        this.vy -= this.controls[3];
    }

    this.shoot = function(){
        var newbullet = new gameComponent(undefined, this.x + (this.radius + bulletSize + 2 + Math.abs(this.vx))*Math.sin(Math.PI*this.theta/180), this.y + (this.radius + bulletSize + 2 + Math.abs(this.vy))*Math.cos(Math.PI*this.theta/180), bulletSize, "black", "black");
        newbullet.vx += 10 + this.vx;
        newbullet.vy += 10 + this.vy;
        newbullet.thV = this.thV;
        newbullet.theta = this.theta;
        newbullet.team = this.team;
        activeBullets.push(newbullet);
    }


    this.contact = function(otherObject){
        var dX = Math.pow(this.x - otherObject.x, 2);
        var dY = Math.pow(this.y - otherObject.y, 2);

        var rD = this.radius + otherObject.radius;

        var d = Math.sqrt(dX + dY);

        var hitcheck = false;

        if(d < (rD + 1)){
            hitcheck = true;
        }

        return hitcheck;
    }

    this.collide = function(otherObject){
        otherObject.ax = this.vx - Math.sign(otherObject.vx)*this.radius/25;
        otherObject.ay = this.vy - Math.sign(otherObject.vy)*this.radius/25; 

        this.ax = otherObject.vx - Math.sign(this.vx)*otherObject.radius/25;
        this.ay = otherObject.vy - Math.sign(this.vy)*otherObject.radius/25;

        this.alpha = otherObject.theta + this.theta;
        otherObject.alpha = this.theta + otherObject.theta;
    }

    this.hitBorder = function(){
        var borderLeft = 0;
        var borderRight = gameScreen.gameArea.width;
        var borderTop = 0;
        var borderBot = gameScreen.gameArea.height;

        var dL = (this.x - this.radius) - borderLeft;
        var dR = borderRight - (this.x + this.radius);
        var dT = (this.y - this.radius) - borderTop;
        var dB = borderBot - (this.y + this.radius);

        var dcX = this.x - borderRight/2;
        // var dcY = this.y - borderTop/2;

        if(dL < 0 || dR < 0){
            this.vxL += -Math.sign(dcX)*this.radius/25;
            this.alpha = 90;
        }

        if(dT < 0){
            this.vyL += this.radius/25;
            this.alpha = 0;   
        }else if(dB < 0){
            this.vyL -= this.radius/25;
            this.alpha = 0; 
        }
    }

    if(this.team == AIteam){
        this.sTime = time;
        this.target = undefined;
        this.controls[2] = cSpeed/2;

        this.AItarget = function(otherObject){
            var dMuzzX = Math.pow((this.x + this.radius*Math.sin(Math.PI*this.theta/180) - otherObject.x), 2);
            var dMuzzY = Math.pow((this.y + this.radius*Math.cos(Math.PI*this.theta/180) - otherObject.y), 2);

            var dMuzz = Math.sqrt(dMuzzX + dMuzzY);

            var dBestX = Math.pow(otherObject.x - this.x, 2);
            var dBestY = Math.pow(otherObject.y - this.y, 2);

            var dBest = Math.sqrt(dBestX + dBestY) - this.radius;

            var dD = dMuzz - dBest;

            if(dMuzz > dBest && dD > 0.001){
                this.theta += dD;
            }else{
                this.theta += -dD;
            }



            if(Math.floor(20*dD) == 0 && (time -botShotFreq*Math.floor(time/botShotFreq)) == (this.sTime -botShotFreq*Math.floor(this.sTime/botShotFreq))){
                this.shoot();
            }
        }
    }
}

function updateGame(){
    gameScreen.clear();
    time++;
    frameNo++;

    if(frameNo == 200){
        ranX = Math.floor(Math.random()*gameScreen.gameArea.width);
        ranY = Math.floor(Math.random()*gameScreen.gameArea.height);
        ranTh = Math.random()*360;
        newEnemy = new gameComponent(1, ranX, ranY, 15, "brown", "blue", 2);
        newEnemy.theta = ranTh;
        gameObjects.push(newEnemy);
        frameNo = 0;
    }

    for(i = 0; i < activeBullets.length; i++){
        if(activeBullets[i].x > gameScreen.gameArea.width || activeBullets[i].x < 0){
            activeBullets.splice(i, 1);
            continue;
        }else if(activeBullets[i].y > gameScreen.gameArea.height || activeBullets[i].y < 0){
            activeBullets.splice(i, 1);
            continue;
        }else{
            for(j = 0; j < gameObjects.length; j++){
                if(activeBullets[i].contact(gameObjects[j])){
                    if(activeBullets[i].team == gameObjects[j].team || gameObjects[j].team == 0){
                        activeBullets.splice(i, 1);
                        bulletFix = 1;
                        break;
                    }else{
                        gameObjects.splice(j, 1);
                    }
                }
            }
            if(bulletFix == 1){
                bulletFix = 0;
                continue;
            }

            activeBullets[i].newPos();
            activeBullets[i].draw();
        }
    }

    for(i = 0; i < gameObjects.length; i++){
        gameObjects[i].hitBorder();

        if(gameObjects[i].team == AIteam){
            if(gameObjects[i].target == undefined){
                var rTarg = Math.floor(Math.random()*(gameObjects.length + 1));
                if(rTarg != i){
                    gameObjects[i].target = rTarg;
                }
            }
            gameObjects[i].AItarget(gameObjects[0]);
        }

        for(j = i + 1; j < gameObjects.length; j++){
            if(gameObjects[i].contact(gameObjects[j])){
                gameObjects[i].collide(gameObjects[j]);
            }
        }
        gameObjects[i].cMove();
        gameObjects[i].newPos();
        gameObjects[i].draw();
    }
}

function runGame(){
    gamerunner = setInterval(updateGame, 10); 
}

function stopGame(){
    clearInterval(gamerunner);
}

document.body.addEventListener("keyup",function(event){
    var x = event.which;
    // console.log(x);
    //KEY: W
    if(x == 87){
        newPlayer.controls[2] = 0;
    }
    //KEY: A
    if(x == 65){
        newPlayer.controls[0] = 0;
    }
    //KEY: S
    if(x == 83){
        newPlayer.controls[3] = 0;
    }
    //KEY: D
    if(x == 68){
        newPlayer.controls[1] = 0;
    }
    //SPACEBAR
    if(x == 32){
        newPlayer.shoot();
    }
    //KEY: UPARROW
    if(x == 38){
        newEnemy.controls[2] = 0;
    }    
    //KEY: LEFTARROW
    if(x == 37){
        newEnemy.controls[0] = 0;
    }    
    //KEY: DOWNARROW
    if(x == 40){
        newEnemy.controls[3] = 0;
    }    
    //KEY: RIGHTARROW
    if(x == 39){
        newEnemy.controls[1] = 0;
    }    
    //KEY: NUMLOCK 0
    if(x == 45){
        newEnemy.shoot();
    }
});

var cSpeed = 0.05;

document.body.addEventListener("keydown",function(event){
    var x = event.which;
    // console.log(x);
    //KEY: W
    if(x == 87){
        newPlayer.controls[2] = 2*cSpeed;
    }
    //KEY: A
    if(x == 65){
        newPlayer.controls[0] = 2*cSpeed;
    }
    //KEY: S
    if(x == 83){
        newPlayer.controls[3] = 2*cSpeed;
    }
    //KEY: D
    if(x == 68){
        newPlayer.controls[1] = 2*cSpeed;
    }    //KEY: UPARROW
    if(x == 38){
        newEnemy.controls[2] = 2*cSpeed;
    }    
    //KEY: LEFTARROW
    if(x == 37){
        newEnemy.controls[0] = cSpeed;
    }    
    //KEY: DOWNARROW
    if(x == 40){
        newEnemy.controls[3] = cSpeed;
    }    
    //KEY: RIGHTARROW
    if(x == 39){
        newEnemy.controls[1] = cSpeed;
    }  
});

// function movePlayer(x){
//     newPlayer.controls[x] = 5;
//     newPlayer.cMove();
//     newPlayer.controls[x] = 0;

//     // newPlayer.controls[x] = 2;
//     // newPlayer.accelerate();
//     // newPlayer.controls[x] = 0;
// };   







