let dpr = window.devicePixelRatio || 1;

class MarchingSquares {
	constructor(canvasId, args = {}) {
		this.main_canvas = document.getElementById(canvasId);
		this.ctx = this.main_canvas.getContext("2d");
		this.inputValues = args.inputValues || [];
		this.gridValues = args.gridValues || [];
		this.circles = args.circles || [];

		// Get the size of the canvas in CSS pixels.
		let rect = this.main_canvas.getBoundingClientRect();
		// Give the canvas pixel dimensions of their CSS size * the device pixel ratio.
		this.main_canvas.width = rect.width * dpr;
		this.main_canvas.height = rect.height * dpr;
		this.ctx.scale(dpr, dpr);
		this.ctx.font = "16px Arial";
		this.ctx.lineWidth = 2;

		this.width = rect.width;
		this.height = rect.height;

		this.rez = args.resolution || 10;
		this.circleCount = args.circleCount || 12;
		this.circleRadius = args.circleRadius || 60;
		if ("interpolation" in args) this.interpolation = args.interpolation;
		else this.interpolation = true;

		this.stepFunc =
			args.stepFunc ||
			(() => {
				this.moveCircles();
				this.updateGridPoints();
				this.drawLines();
				this.drawCircles();
				this.drawPoints();
			});

		console.log(
			"initialized MarchingSquares class for",
			this.main_canvas,
			"with arguments",
			args
		);

		//start everything up
		this.generateMap();
		this.generateCircles();
		requestAnimationFrame(this.stepSimulation.bind(this));
	}

	setCanvasSize() {
		// Get the size of the canvas in CSS pixels.
		let rect = this.main_canvas.getBoundingClientRect();
		// Give the canvas pixel dimensions of their CSS size * the device pixel ratio.
		this.main_canvas.width = rect.width * dpr;
		this.main_canvas.height = rect.height * dpr;
		this.ctx.scale(dpr, dpr);

		this.width = rect.width;
		this.height = rect.height;
		this.generateMap();
		this.generateCircles();
	}

	//initialization methods
	generateCircle() {
		var adjusted_r = (this.circleRadius * this.width) / 1000;
		var circle = {
			x: Math.random() * this.width,
			y: Math.random() * this.height,
			vx: 2 * Math.random() - 1,
			vy: 2 * Math.random() - 1,
			r: adjusted_r + adjusted_r * Math.random()
		};

		circle.r2 = circle.r * circle.r;

		return circle;
	}

	generateCircles() {
		this.circles = [];
		for (var i = 0; i < this.circleCount; i++) {
			this.circles.push(this.generateCircle());
		}
	}

	setCircleRadius(newRad) {
		this.circleRadius = newRad;
		this.generateCircles();
	}

	generateMap() {
		this.inputValues = new Array(0 | (1 + this.height / this.rez));
		//the grid is one smaller in x and y direction than the input
		this.gridValues = new Array(this.inputValues.length - 1);
		for (var y = 0; y < this.inputValues.length; y++)
			this.inputValues[y] = new Array(0 | (1 + this.width / this.rez));

		for (var y = 0; y < this.gridValues.length; y++)
			this.gridValues[y] = new Array(this.inputValues[0].length - 1);
	}

	//simulation methods
	moveCircles() {
		for (var circle of this.circles) {
			//move the circles by their respective velocities
			circle.x += circle.vx;
			circle.y += circle.vy;

			//bounce the circles off walls
			if (circle.x + circle.r > this.width) circle.vx = -Math.abs(circle.vx);
			else if (circle.x - circle.r < 0) circle.vx = Math.abs(circle.vx);
			if (circle.y + circle.r > this.height) circle.vy = -Math.abs(circle.vy);
			else if (circle.y - circle.r < 0) circle.vy = Math.abs(circle.vy);
		}

		let rect = this.main_canvas.getBoundingClientRect();
		let x = mouseCircle.gx - rect.left;
		x *= this.width / rect.width;
		let y = mouseCircle.gy - rect.top;
		y *= this.height / rect.height;

		mouseCircle.x = x;
		mouseCircle.y = y;

		if (x > 0 && x < rect.width && y > 0 && y < rect.height) {
			this.circles[0].x = x;
			this.circles[0].y = y;
		}
	}

	updateGridPoints() {
		for (var y = 0; y < this.inputValues.length; y++) {
			for (var x = 0; x < this.inputValues[y].length; x++) {
				var addedDistances = 0;
				var rx = x * this.rez;
				var ry = y * this.rez;
				this.circles.forEach((circle, i) => {
					addedDistances +=
						circle.r2 / ((circle.y - ry) ** 2 + (circle.x - rx) ** 2);
				});

				this.inputValues[y][x] = addedDistances;
			}
		}

		for (var y = 0; y < this.gridValues.length; y++) {
			for (var x = 0; x < this.gridValues[y].length; x++) {
				this.gridValues[y][x] = binaryToType(
					this.inputValues[y][x] > 1,
					this.inputValues[y][x + 1] > 1,
					this.inputValues[y + 1][x + 1] > 1,
					this.inputValues[y + 1][x] > 1
				);
			}
		}
	}

	//drawing methods
	drawCircles() {
		this.ctx.strokeStyle = primary;
		for (var circle of this.circles) {
			this.ctx.beginPath();
			this.ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
			this.ctx.stroke();
		}
	}

	drawPoints() {
		//draw debug information on coarse grids
		if (this.rez >= 50) {
			for (var y = 0; y < this.inputValues.length; y++) {
				for (var x = 0; x < this.inputValues[y].length; x++) {
					if (this.inputValues[y][x] > 1) this.ctx.fillStyle = secondary;
					else this.ctx.fillStyle = primary;

					this.ctx.fillText(
						this.inputValues[y][x].toFixed(1),
						x * this.rez,
						y * this.rez
					);
				}
			}
		}
	}

	line(from, to) {
		this.ctx.moveTo(from[0], from[1]);
		this.ctx.lineTo(to[0], to[1]);
	}

	drawLines() {
		this.ctx.beginPath();
		this.ctx.lineWidth = 2;
		this.ctx.strokeStyle = secondary;
		for (var y = 0; y < this.gridValues.length; y++) {
			for (var x = 0; x < this.gridValues[y].length; x++) {
				if (!this.interpolation) {
					//abcd uninterpolated
					var a = [x * this.rez + this.rez / 2, y * this.rez];
					var b = [x * this.rez + this.rez, y * this.rez + this.rez / 2];
					var c = [x * this.rez + this.rez / 2, y * this.rez + this.rez];
					var d = [x * this.rez, y * this.rez + this.rez / 2];
				} else {
					//abcd interpolated
					var nw = this.inputValues[y][x];
					var ne = this.inputValues[y][x + 1];
					var se = this.inputValues[y + 1][x + 1];
					var sw = this.inputValues[y + 1][x];
					var a = [x * this.rez + this.rez * lerp(1, nw, ne), y * this.rez];
					var b = [
						x * this.rez + this.rez,
						y * this.rez + this.rez * lerp(1, ne, se)
					];
					var c = [
						x * this.rez + this.rez * lerp(1, sw, se),
						y * this.rez + this.rez
					];
					var d = [x * this.rez, y * this.rez + this.rez * lerp(1, nw, sw)];
				}

				switch (this.gridValues[y][x]) {
					case 1:
					case 14:
						this.line(d, c);
						break;

					case 2:
					case 13:
						this.line(b, c);
						break;

					case 3:
					case 12:
						this.line(d, b);
						break;

					case 11:
					case 4:
						this.line(a, b);
						break;

					case 5:
						this.line(d, a);
						this.line(c, b);
						break;
					case 6:
					case 9:
						this.line(c, a);
						break;

					case 7:
					case 8:
						this.line(d, a);
						break;

					case 10:
						this.line(a, b);
						this.line(c, d);
						break;
					default:
						break;
				}
			}
		}
		this.ctx.stroke();
	}

	stepSimulation() {
		//draw stuff
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.stepFunc();

		requestAnimationFrame(this.stepSimulation.bind(this));
	}
}

function lerp(x, x0, x1, y0 = 0, y1 = 1) {
	if (x0 === x1) {
		return null;
	}

	return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

function binaryToType(nw, ne, se, sw) {
	a = [nw, ne, se, sw];
	return a.reduce((res, x) => (res << 1) | x);
}

window.addEventListener("mousemove", ev => {
	mouseCircle.gx = ev.clientX;
	mouseCircle.gy = ev.clientY;
});

var mouseCircle = {};
