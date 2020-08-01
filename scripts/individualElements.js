var typesList = [];
var gridValuesDemo = document.getElementById("gridElementTypes");
var demoContext = gridValuesDemo.getContext("2d");

demoContext.font = "16px Arial";
demoContext.lineWidth = 2;

for (var i = 0; i < 16; i++) {
	typesList.push(i.toString(2).padStart(4, "0"));
}

var offset = 120;
var size = 60;

function drawNumber(num, x, y) {
	if (num >= 1) demoContext.fillStyle = secondary;
	else demoContext.fillStyle = primary;
	demoContext.fillText(num, x, y);
}

function drawLines() {
	demoContext.beginPath();
	demoContext.strokeStyle = primary;

	for (var y = 0; y < 4; y++)
		for (var x = 0; x < 4; x++) {
			demoContext.rect(x * offset, y * offset, size, size);
			drawNumber(typesList[4 * y + x][0], x * offset, y * offset);
			drawNumber(typesList[4 * y + x][1], x * offset + size, y * offset);
			drawNumber(typesList[4 * y + x][2], x * offset + size, y * offset + size);
			drawNumber(typesList[4 * y + x][3], x * offset, y * offset + size);
		}

	demoContext.stroke();
	demoContext.beginPath();
	demoContext.strokeStyle = secondary;
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			var a = [x * offset + size / 2, y * offset];
			var b = [x * offset + size, y * offset + size / 2];
			var c = [x * offset + size / 2, y * offset + size];
			var d = [x * offset, y * offset + size / 2];

			switch (typesList[4 * y + x]) {
				case "0001":
				case "1110":
					line(d, c);
					break;

				case "0010":
				case "1101":
					line(b, c);
					break;

				case "0011":
				case "1100":
					line(d, b);
					break;

				case "1011":
				case "0100":
					line(a, b);
					break;

				case "0101":
					line(d, a);
					line(c, b);
					break;
				case "0110":
				case "1001":
					line(c, a);
					break;

				case "0111":
				case "1000":
					line(d, a);
					break;

				case "1010":
					line(a, b);
					line(c, d);
					break;
				default:
					break;
			}
		}
	}
	demoContext.stroke();
}

function line(from, to) {
	demoContext.moveTo(from[0], from[1]);
	demoContext.lineTo(to[0], to[1]);
}

demoContext.translate(10, 35);
drawLines();
