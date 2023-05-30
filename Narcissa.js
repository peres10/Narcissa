/*	Narcissa

Aluno 1: 61615 Alexandre Peres 
Aluno 2: 61733 Tomás Ferreira 

Comentario:

O ficheiro "Narcissa.js" tem de incluir, logo nas primeiras linhas,
um comentÃ¡rio inicial contendo: o nome e nÃºmero dos dois alunos que
realizaram o projeto; indicaÃ§Ã£o de quais as partes do trabalho que
foram feitas e das que nÃ£o foram feitas (para facilitar uma correÃ§Ã£o
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementaÃ§Ã£o que possam ser menos Ã³bvios para o avaliador.

0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
*/



// GLOBAL CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 4;

const IMAGE_NAME_EMPTY = "empty";
const IMAGE_NAME_INVALID = "invalid";
const IMAGE_NAME_SHRUB = "shrub";
const IMAGE_NAME_BERRY_BLUE = "berryBlue";
const IMAGE_NAME_SNAKE_HEAD = "snakeHead";
const IMAGE_NAME_SNAKE_BODY = "snakeBody";



// GLOBAL VARIABLES

let control;	// Try not no define more global variables


// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.atime = 0;	// This has a very technical role in the control of the animations
		this.imageName = imageName;
		this.show();
	}
	draw(x, y, image) {
		control.ctx.drawImage(image, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}
	show() {
		this.checkPosition();
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y, GameImages[this.imageName]);
	}
	hide() {
		control.world[this.x][this.y] = control.getEmpty();
		this.draw(this.x, this.y, GameImages[IMAGE_NAME_EMPTY]);
	}
	move(dx, dy) {
		let nextX = this.x + dx;
        let nextY = this.y + dy;


		if (nextX < 0) {
			nextX = WORLD_WIDTH - 1; // Wrap to the right side
		} else if (nextX >= WORLD_WIDTH) {
			nextX = 0; // Wrap to the left side
		}

		if (nextY < 0) {
			nextY = WORLD_HEIGHT - 1; // Wrap to the bottom
		} else if (nextY >= WORLD_HEIGHT) {
			nextY = 0; // Wrap to the top
		}

        this.hide()
        this.x = nextX;
        this.y = nextY;
		this.show();
	}
	animation(x, y) {
	}
	checkPosition() {
		if (control.world[this.x] === undefined
		|| control.world[this.x][this.y] === undefined)
			fatalError("Invalid position");
	}
}


class Shrub extends Actor {
	constructor(x, y, color) { super(x, y, IMAGE_NAME_SHRUB); }
}

class Empty extends Actor {
	constructor() {
		super(-1, -1, IMAGE_NAME_EMPTY);
		this.atime = Number.MAX_SAFE_INTEGER;	// This has a very technical role
	}
	show() {}
	hide() {}
}

class Invalid extends Actor {
	constructor(x, y) { super(x, y, IMAGE_NAME_INVALID); }
}


class Berry extends Actor {
	constructor(x, y, color) {
		super(x, y, color);
	}
}

class SnakeBody extends Actor {
	constructor(x,y){
		super(x,y, IMAGE_NAME_SNAKE_BODY);
	}
	move(newX,newY){
		this.hide();
		this.x = newX;
		this.y = newY;
		this.show()
	}

}

class Snake extends Actor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_HEAD);
		this.startX = x;
		this.startY = y;
		[this.movex, this.movey] = [0,0];
		this.snakeSize = document.getElementById("snakeSize");
	
		this.snakeParts = []
		this.lastThreeBerries = [];
		this.addInitialBodyParts()
		this.updateSnakeSize()
	}

	addInitialBodyParts(){
		this.snakeParts.push(new SnakeBody(this.x-1,this.y))
		this.snakeParts.push(new SnakeBody(this.x-2,this.y))
		this.snakeParts.push(new SnakeBody(this.x-3,this.y))
		this.lastBodyPart = new SnakeBody(this.x-4,this.y)
		this.snakeParts.push(this.lastBodyPart)
	}
    /*addBodyPart(x,y){
        const bodyPart = new Actor(x,y, IMAGE_NAME_SNAKE_BODY);
        this.body.push(bodyPart);
    }*/

	handleKey() {
		let k = control.getKey();
        
        //console.log(k)
		if (k === null)	// ignore
			;
		else if (typeof(k) === "string")	// special command
			// special command
			//mesg("special command == " + k)
            ;
		else {	// change direction
			let kx, ky;
			[kx, ky] = k;
			//mesg("change direction == " + k)
			if (kx === -this.movex && ky=== -this.movey){

			} else {
            	this.movex = kx;
            	this.movey = ky;
			}
		}
	}
	move(dx,dy){

		let nextX = this.x + dx;
        let nextY = this.y + dy;

		if (nextX < 0) {
			nextX = WORLD_WIDTH - 1; // Wrap to the right side
		} else if (nextX >= WORLD_WIDTH) {
			nextX = 0; // Wrap to the left side
		}

		if (nextY < 0) {
			nextY = WORLD_HEIGHT - 1; // Wrap to the bottom
		} else if (nextY >= WORLD_HEIGHT) {
			nextY = 0; // Wrap to the top
		}


		const actorAtNewPosition = control.world[nextX][nextY];

        if (actorAtNewPosition instanceof Berry){
			this.pickUpBerry(actorAtNewPosition)
        }

        if(actorAtNewPosition instanceof Shrub || actorAtNewPosition instanceof SnakeBody){
            this.gameOver()
            return;
        }

		let prevX = this.x;
		let prevY = this.y;

		super.move(dx,dy)

		if(!(this.movex == 0 && this.movey == 0))
			this.moveBodyParts(prevX,prevY)
	}


	moveBodyParts(prevX,prevY){
		for(let i = 0; i < this.snakeParts.length; i++){
				
			let auxX = this.snakeParts[i].x;
			let auxY = this.snakeParts[i].y;
			this.snakeParts[i].move(prevX,prevY)

			prevX = auxX;
			prevY = auxY;
		}
	}
	checkWhenEat(berryColor){
		let flag = false
		for(let i = 0; i < this.lastThreeBerries.length;i++){
			if(this.lastThreeBerries[i].imageName == berryColor){
				flag = true;
				break;
			}
		}
		if(flag){
			if(this.snakeParts.length == 4){
			} 
			else if(Math.floor((this.snakeParts.length+1)/2 <= 5)){
				console.log("aaa")
				while(this.snakeParts.length>4){
					let snakePart = this.snakeParts.pop();
					snakePart.hide()
				}
				console.log(this.snakeParts.length)
			}
			else{
				let i = Math.floor((this.snakeParts.length+1)/2);	
				for(i; i>=0; i--){
					let snakePart = this.snakeParts.pop();
					snakePart.hide()
				}	
			}	
		}
		return flag
	}
	pickUpBerry(berry){
		berry.hide()
		
		let flag = this.checkWhenEat(berry.imageName);
		let aux = this.lastThreeBerries.length+1


		console.log(this.lastThreeBerries.toString)
		if(!flag){
			if(aux <= 3){
				console.log("a")
				this.snakeParts[aux-1].imageName = berry.imageName
				this.lastThreeBerries.push(berry)
			}
			else{
				console.log("b")
				for(let i=2; i>0; i--){
					this.snakeParts[i].imageName = this.snakeParts[i-1].imageName;
				}
				this.snakeParts[0].imageName = berry.imageName
				this.snakeParts[3].imageName = IMAGE_NAME_SNAKE_BODY;
				this.lastThreeBerries.pop()
				this.lastThreeBerries.unshift(berry);

			}
			

			let newBodyPart = new SnakeBody(this.lastBodyPart.x-1,this.lastBodyPart.y-1)
			//newBodyPart.imageName = berry.imageName
			this.lastBodyPart = newBodyPart;
			this.snakeParts.push(newBodyPart)
		}
		this.updateSnakeSize();
	}
	animation(x, y) {
		this.handleKey();
		this.move(this.movex, this.movey);
	}
	updateSnakeSize(){
		this.snakeSize.textContent = this.snakeParts.length + 1
	}
    gameOver(){
		for (let i = 0; i < this.snakeParts.length; i++) {
			this.snakeParts[i].hide();
		}

		this.snakeParts = [];

		this.hide()

        control.gameOver();
    }
}



// GAME CONTROL

class GameControl {
	constructor() {
		let c = document.getElementById('canvas1');
		control = this;	// setup global var
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		this.empty = new Empty();	// only one empty actor needed, global var
		this.world = this.createWorld();
		this.loadLevel(1);
		this.setupEvents();
        this.isPaused = true;
        this.timeDisplay = document.getElementById("timeDisplay");
	}
	getEmpty() {
		return this.empty;
	}
	createWorld() { // matrix needs to be stored by columns
		let world = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = this.empty;
			world[x] = a;
		}
		return world;
	}
	loadLevel(level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];	// -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map is stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
	}
	getKey() {
		let k = this.key;
		this.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0];	// LEFT, O, J
			case 38: case 81: case 73: return [0, -1];	// UP, Q, I
			case 39: case 80: case 76: return [1, 0];	// RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];	// DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	}
	setupEvents() {
		addEventListener("keydown", e => this.keyDownEvent(e), false);
		addEventListener("keyup", e => this.keyUpEvent(e), false);
		setInterval(() => this.animationEvent(), 1000 / ANIMATION_EVENTS_PER_SECOND);
	}
	animationEvent() {
        if( this.isPaused ){
            return;
        }
		this.time++;
        this.timeDisplay.textContent = "Time: " + this.time;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let a = this.world[x][y];
				if( a.atime < this.time ) {
					a.atime = this.time;
					a.animation(x, y);
				}
			}
	}
	keyDownEvent(e) {
        this.isPaused = false
		this.key = e.keyCode;
	}
	keyUpEvent(e) {
	}
    pauseGame(){
        this.isPaused = !this.isPaused;
        const pauseButton = document.getElementById("pauseButton");

        pauseButton.value = this.isPaused ? "Resume" : "Pause";
    }
    gameOver(){
        alert("Game over!")
		this.loadLevel(1);
        this.time = 0
    }
}


// Functions called from the HTML page

function onLoad() {
	// Asynchronously load the images an then run the game
	GameImages.loadAll(() => new GameControl());
}

function b1() { mesg("button1") }
function b2() { mesg("button2") }