window.onload = function(){

	// select canvas
	const cvs = document.getElementById("mycanvas")
	const ctx = cvs.getContext("2d");

	// game vars and conts
	let frames = 0;
	const DEGREE = Math.PI/180;

	//Load sprite image
	const sprite = new Image();
	sprite.src = "./img/sprite.png"

	// GAME STATE
	const state = {
		current : 0,
		getReady : 0,
		game : 1,
		over : 2
	}
	// CONTROL THE GAME
	cvs.addEventListener("click", function(evt) {
		switch (state.current) {
			case state.getReady:
				state.current = state.game;
				break;
			case state.game:
				bird.flap();
				break;
			case state.over:
				state.current =  state.getReady;
				break;
		}
	});

	//ctx.drawImage(sprite, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight)
	//sX : spriteでとって来たいspriteのx座標
	//sY : spriteでとって来たいspriteのy座標
	//sWidth : spriteでとって来たいspriteの(x, y)座標からの横幅
	//sHeight : spriteでとって来たいspriteの(x, y)座標からの縦
	//dX : Destination Canvasで描き始めたいx座標
	//dY : Destination Canvasで描き始めたいy座標
	//dWidth : Destination Canvasで描き始めたい(x, y)座標からの横幅
	//dHeight : Destination Canvasで描き始めたい(x, y)座標からの縦

	//background
	const bg = {
		sX : 0,
		sY : 0,
		w : 275,
		h : 226,
		x : 0,
		y : cvs.height - 226,

		draw :  function() {
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
		}
	}

	// FOOREGROUND
	const fg = {
		sX : 276,
		sY : 0,
		w : 224,
		h : 112,
		x : 0,
		y : cvs.height - 112,

		dx : 2,

		draw : function () {
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
		},

		update: function () {
			if(state.current == state.game) {
				this.x = (this.x - this.dx)%(this.w/2);
			}
		}
	}

	// BIRD
	const bird = {
		animation : [
			{sX: 276, sY :112}, //this.animation[0]
			{sX: 276, sY :139}, //this.animation[1]
			{sX: 276, sY :164}, //this.animation[2]
			{sX: 276, sY :139}, //this.animation[3]
		],
		w: 34,
		h: 26,
		x: 50,
		y: 150,

		radius : 12,

		frame : 0,

		gravity : 0.2,
		jump: 	4.6,
		speed : 0,
		rotation: 0,

		draw : function() {
			let bird = this.animation[this.frame];

			ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.rotation);
			ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, - this.w/2, - this.h/2, this.w, this.h);
			ctx.restore();
		},

		flap : function() {
			this.speed -= this.jump;
			this.rotation = 0* DEGREE;
		},

		update : function() {
			// If the game state is get ready state, the bird must flap slowly
			this.period = state.current == state.getReady ? 10 :5
			// We increment the frame by 1, eath period
			this.frame += frames%this.period == 0 ? 1:0;
			// Frames goes from 0 to 4, then again to 0
			this.frame = this.frame%this.animation.length;

			if(state.current == state.getReady) {
				this.y = 150; // Reset Position of the bird after game over
				this.speed = 0;
				this.rotation = 0 * DEGREE;
			} else {
				this.speed += this.gravity;
				this.y += this.speed;

				if(this.y + this.h/2 >= cvs.height - fg.h) {
					// もし、土に鳥が着いたら
					this.y = cvs.height - fg.h - this.h/2;
					if(state.current == state.game) {
						state.current = state.over;
					}
				}

				// IF THE SPEED IS GREATER THAN THE JUMP MEANS THE BIRD IS FALLING DOWN
				if(this.speed >= this.jump) {
					this.rotation = 90*DEGREE;
					this.frame = 1;
				} else {
					this.rotation = -25*DEGREE;
				}
			}
		}
	}

	// GET READY MESSAGE
	const getReady = {
		sX : 0,
		sY : 228,
		w : 173,
		h : 152,
		x : cvs.width/2 - 173/2,
		y : 80,

		draw : function() {
			if(state.current == state.getReady) {
				ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
			}
		}
	}

	// GET READY MESSAGE
	const gameover = {
		sX : 175,
		sY : 228,
		w : 225,
		h : 202,
		x : cvs.width/2 - 225/2,
		y : 90,

		draw : function() {
			if(state.current == state.over)
			ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
		}
	}

	//PIPES
	const pipes = {
		position : [],

		top : {
			sX : 553,
			sY : 0
		},
		bottom : {
			sX : 502,
			sY : 0
		},

		w : 53,
		h : 400,
		gap : 100,
		maxYPos : -150,
		dx : 2,

		draw : function() {
			for(let i = 0; i < this.position.length; i++) {
				let p = this.position[i];

				let topYPos = p.y;
				let bottomYPos = p.y + this.h + this.gap;

				// top pipe
				ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

				// bottom pipe
				ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
			}
		},

		update : function() {
			if(state.current !== state.game) {
				return;
			}

			if(frames%100 == 0) {
				this.position.push({
					x : cvs.width,
					y : this.maxYPos * ( Math.random() + 1)
				})
			}
			for(let i = 0; i < this.position.length; i++) {
				let p = this.position[i];


				let bottomPipeYPos = p.y + this.h + this.gap;

				// COLLISION DETECTION
				// TOP PIPE
				if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
					bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
					state.current = state.over;
				}
				// BOTTOM PIPE
				if(bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w &&
					bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
					state.current = state.over;
				}

				// MOVE THE PIPE TO THE LEFT
				p.x -= this.dx;

				// if the pipes go beyond canvas, we delete them from canvas
				if(p.x + this.w <= 0) {
					this.position.shift();
				}
			}
		}
	}

	// draw
	function draw() {
		ctx.fillStyle = "#70c5ce";
		ctx.fillRect(0,0, cvs.width, cvs.height)

		bg.draw();
		pipes.draw();
		fg.draw();
		bird.draw();
		getReady.draw();
		gameover.draw();
	}

	// update
	function update() {
		bird.update()
		fg.update()
		pipes.update()
	}

	//loop
	function loop() {
		update();
		draw();
		frames++;

		requestAnimationFrame(loop)
	}

	loop()
}