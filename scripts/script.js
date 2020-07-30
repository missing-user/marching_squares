var main_canvas = document.getElementById("canvas");
var ctx = main_canvas.getContext("2d");

var inputValues = [];
var gridValues = [];
var circles = [];
var rez = 10;
var interpolation = true;

//initialization methods
function generateCircle() {
	var circle = {
		x: Math.random() * main_canvas.width,
		y: Math.random() * main_canvas.height,
		vx: 2 * Math.random() - 1,
		vy: 2 * Math.random() - 1,
		r: 20 + 60 * Math.random()
	};

	circle.r2 = circle.r * circle.r;

	return circle;
}

function generateCircles() {
	circles = [];
	circles.push({
		x: Math.random() * main_canvas.width,
		y: Math.random() * main_canvas.height,
		vx: 0,
		vy: 0,
		r: 60,
		r2: 60 * 60
	});
	for (var i = 0; i < 10; i++) {
		circles.push(generateCircle());
	}
}

function generateMap() {
	inputValues = new Array(0 | (main_canvas.height / rez));
	//the grid is one smaller in x and y direction than the input
	gridValues = new Array(inputValues.length - 1);
	for (var y = 0; y < inputValues.length; y++) {
		inputValues[y] = new Array(0 | (main_canvas.width / rez));
	}
	for (var y = 0; y < gridValues.length; y++) {
		gridValues[y] = new Array(inputValues[0].length - 1);
	}
}

//drawing methods
function drawCircles() {
	ctx.strokeStyle = primary;
	for (var circle of circles) {
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
		ctx.stroke();
	}
}

function drawPoints() {
	for (var circle of circles) {
		ctx.beginPath();
		ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
		ctx.stroke();
	}

	//draw debug information on coarse grids
	if (rez >= 50) {
		for (var y = 0; y < inputValues.length; y++) {
			for (var x = 0; x < inputValues[y].length; x++) {
				if (inputValues[y][x] > 1) ctx.fillStyle = secondary;
				else ctx.fillStyle = primary;

				ctx.fillText(inputValues[y][x].toFixed(2), x * rez, y * rez);
			}
		}
	}
}

function line(from, to) {
	ctx.moveTo(from[0], from[1]);
	ctx.lineTo(to[0], to[1]);
}

function lerp(x, x0, x1, y0 = 0, y1 = 1) {
	if (x0 === x1) {
		return null;
	}

	return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

function drawLines() {
	ctx.beginPath();
	ctx.strokeStyle = secondary;
	for (var y = 0; y < gridValues.length; y++) {
		for (var x = 0; x < gridValues[y].length; x++) {
			if (!interpolation) {
				//abcd uninterpolated
				a = [x * rez + rez / 2, y * rez];
				b = [x * rez + rez, y * rez + rez / 2];
				c = [x * rez + rez / 2, y * rez + rez];
				d = [x * rez, y * rez + rez / 2];
			} else {
				//abcd interpolated
				nw = inputValues[y][x];
				ne = inputValues[y][x + 1];
				se = inputValues[y + 1][x + 1];
				sw = inputValues[y + 1][x];
				a = [x * rez + rez * lerp(1, nw, ne), y * rez];
				b = [x * rez + rez, y * rez + rez * lerp(1, ne, se)];
				c = [x * rez + rez * lerp(1, sw, se), y * rez + rez];
				d = [x * rez, y * rez + rez * lerp(1, nw, sw)];
			}

			switch (gridValues[y][x]) {
				case 1:
				case 14:
					line(d, c);
					break;

				case 2:
				case 13:
					line(b, c);
					break;

				case 3:
				case 12:
					line(d, b);
					break;

				case 11:
				case 4:
					line(a, b);
					break;

				case 5:
					line(d, a);
					line(c, b);
					break;
				case 6:
				case 9:
					line(c, a);
					break;

				case 7:
				case 8:
					line(d, a);
					break;

				case 10:
					line(a, b);
					line(c, d);
					break;
				default:
					break;
			}
		}
	}
	ctx.stroke();
}

//simulation methods
function moveCircles() {
	for (var circle of circles) {
		//move the circles by their respective velocities
		circle.x += circle.vx;
		circle.y += circle.vy;

		//bounce the circles off walls
		if (circle.x + circle.r > main_canvas.width)
			circle.vx = -Math.abs(circle.vx);
		else if (circle.x - circle.r < 0) circle.vx = Math.abs(circle.vx);
		if (circle.y + circle.r > main_canvas.height)
			circle.vy = -Math.abs(circle.vy);
		else if (circle.y - circle.r < 0) circle.vy = Math.abs(circle.vy);
	}
}

function updateGridPoints() {
	for (var y = 0; y < inputValues.length; y++) {
		for (var x = 0; x < inputValues[y].length; x++) {
			addedDistances = 0;
			rx = x * rez;
			ry = y * rez;
			circles.forEach((circle, i) => {
				addedDistances +=
					circle.r2 / ((circle.y - ry) ** 2 + (circle.x - rx) ** 2);
			});

			inputValues[y][x] = addedDistances;
		}
	}

	for (var y = 0; y < gridValues.length; y++) {
		for (var x = 0; x < gridValues[y].length; x++) {
			gridValues[y][x] = binaryToType(
				inputValues[y][x] > 1,
				inputValues[y][x + 1] > 1,
				inputValues[y + 1][x + 1] > 1,
				inputValues[y + 1][x] > 1
			);
		}
	}
}

function binaryToType(nw, ne, se, sw) {
	a = [nw, ne, se, sw];
	return a.reduce((res, x) => (res << 1) | x);
}

function stepSimulation() {
	moveCircles();
	updateGridPoints();

	//draw stuff
	ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);
	drawLines();
	drawCircles();
	drawPoints();

	requestAnimationFrame(stepSimulation);
}

//start everything up
generateMap();
generateCircles();
canvas.addEventListener("mousemove", movePointer, false);
function movePointer(event) {
	let rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	x *= canvas.width / rect.width;
	let y = event.clientY - rect.top;
	y *= canvas.height / rect.height;
	if (circles.length > 0) {
		circles[0].x = x;
		circles[0].y = y;
	}
}
requestAnimationFrame(stepSimulation);
