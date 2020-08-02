var m = new MarchingSquares("canvas", {
	circleRadius: 40,
	stepFunc() {
		if (!this.paused) {
			this.moveCircles();
			this.updateGridPoints();
		}
		this.drawLines();
		this.drawPoints();

		this.endpoint = (2 * window.innerHeight) / 3;
		this.startpoint = window.innerHeight / 8;

		if (document.documentElement.scrollTop > this.endpoint + this.startpoint) {
			m.paused = true;
			this.ctx.globalAlpha = 0;
		} else {
			//blur = Math.max(0, lerp(document.documentElement.scrollTop - startpoint, 0, endpoint, 0, 12)); m.ctx.filter = ["blur(", blur, "px)"].join('');
			this.ctx.globalAlpha = Math.max(
				0,
				lerp(
					document.documentElement.scrollTop - this.startpoint,
					0,
					this.endpoint,
					1,
					0
				)
			);
			this.paused = false;
		}

		if (this.showCircles) {
			this.drawCircles();
		}
	}
});

var explanationSection = document.getElementById("explanation");
setTimeout(() => {
	explanationSection.classList.add("show");
}, 2000);

window.addEventListener("resize", m.setCanvasSize.bind(m));

window.onscroll = function() {
	scrollFunction();
};

function scrollFunction() {
	if (document.documentElement.scrollTop > 10)
		explanationSection.classList.add("show");
}

var gridValuesDemo = new MarchingSquares("gridValuesDemo", {
	resolution: 50,
	interpolation: false,
	circleCount: 5,
	circleRadius: 80,
	stepFunc() {
		this.moveCircles();
		this.updateGridPoints();
		this.drawCircles();
		this.drawPoints();
	}
});
var coarseNoInterp = new MarchingSquares("coarseNoInterp", {
	resolution: 50,
	circleCount: 5,
	interpolation: false,
	circleRadius: 80
});

var noInterp = new MarchingSquares("noInterp", {
	resolution: 10,
	circleCount: 5,
	interpolation: false
});

var highResDemo = new MarchingSquares("highResDemo", {
	resolution: 10,
	circleCount: 8
});

var interpolatedDemo = new MarchingSquares("interpolatedDemo", {
	resolution: 50,
	circleCount: 5,
	circleRadius: 80
});
