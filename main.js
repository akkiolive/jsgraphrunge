(function(){
	//element and context
	var stage = document.getElementById('stage'); //element
	var ctx; //context
	

	//keydown 
	//document.onkeydown = keydown;
	stage.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に
	stage.addEventListener('keydown', keydown, {passive:false});

	//canvas size
	var width = 480;
	var height = 260; 

	//return if element not exist
	if(typeof stage.getContext === 'undefined'){
		return;
	}

	//create context instance
	ctx = stage.getContext('2d');

	//setting width and height
	stage.width = width;
	stage.height = height;
	
	//adopt high resolution
	stage.style.width = width + 'px';
	stage.style.height = height + 'px';

	class Range{
		constructor(xmin, ymin, xmax, ymax){
			this.xmin = xmin;
			this.ymin = ymin;
			this.xmax = xmax;
			this.ymax = ymax;
			this.xdistance = this.xmax - this.xmin;
			if(this.xdistance<0)this.xdistance=-this.xdistance;
			this.ydistance = this.ymax - this.ymin;
			if(this.ydistance<0)this.ydistance=-this.ydistance;
		}

		inrangex(x){
			if(this.xmin <= x && x <= this.xmax) return 1;
			else return 0;
		}

		inrangey(y){
			if(this.ymin <= y && y <= this.ymax) return 1;
			else return 0;
		}

	}

	class Grid{
		constructor(xstep, ystep){
			this.xstep = xstep;
			this.ystep = ystep;
		}
	}

	var range = new Range(0,0,10,10);
	var grid = new Grid(10,10);

	class Point{
		constructor(x, y){
			this.x = x;
			this.y = y;
		}
	}

	function findmin(data){ //find minimum x in array that is included Point
		var mini, min;
		for(var i in data){
			if(i==0 || min>data[i].x){
				min = data[i].x;
				mini = i;
			}
		}
		return mini;
	}
	function findmax(data){
		var maxi, max;
		for(var i in data){
			if(i==0 || max<data[i].x){
				max = data[i].x;
				maxi = i;
			}
		}
		return maxi;
	}

	class DrawFlags{
		constructor(){
			this.border = 1;
			this.grid = 1;
			this.xzeroaxis = 1;
			this.yzeroaxis = 1;
		}
	}

	class DrawStyle{
		constructor(style="point"){
			this.style = style;
		}
	}


	class Graph{
		constructor(x,y, width, height, range, grid){
			this.location = new Point(x,y);
			this.size = new Point(width,height);
			this.range = range;
			this.grid = grid;
			this.dtl = new Point(undefined, undefined);
			this.ltd = new Point(undefined, undefined);
			this.data = [];
			this.originingraph = new Point(undefined,undefined);
			this.flags = new DrawFlags();
			this.style = new DrawStyle();
		}

		setStyle(style){
			this.style = style;
		}

		renewRange(){
			var mini = findmin(this.data);
			var maxi = findmax(this.data);
			this.range = new Range(this.data[mini].x, this.data[mini].y, this.data[maxi].x, this.data[maxi].y);
			this.dtl.x = this.size.x / this.range.xdistance;
			this.dtl.y = this.size.y / this.range.ydistance;
			this.ltd.x = 1.0 / this.dtl.x;
			this.ltd.y = 1.0 / this.dtl.y;
			this.originingraph.x  = -this.range.xmin*this.dtl.x;
			this.originingraph.y  = -this.range.ymin*this.dtl.y;
		}

		addData(data){
			console.log("add data.");
			for(var d of data) this.data.push(d);
			this.renewRange();
		}

		addPoint(point){
			console.log("add point -> ("+point.x+", "+point.y+")");
			this.data.push(point);
			this.renewRange();
		}


		draw(){
			this.renewRange();
			this.drawGrid();
			this.drawTics(10,10);
			this.drawBorder();
			if(this.style=="p"){
				for(var p of this.data){
					this.drawPoint(p);
				}
			}
			else if(this.style=="lp"){
				this.drawLinePoint(this.data);
			}
		}

		d2l(point){ //invert point to location
			var x = point.x * this.dtl.x + this.originingraph.x + this.location.x;
			var y = -point.y * this.dtl.y - this.originingraph.y + this.location.y;
			return new Point(x,y);
		}

		drawPoint(point){
			var x = point.x * this.dtl.x + this.originingraph.x + this.location.x;
			var y = -point.y * this.dtl.y + this.originingraph.y + this.location.y;
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(x,y,3, 0, 2.0*Math.PI);
			ctx.fill();
			console.log("draw point -> ("+x+","+y+")");
		}

		drawLinePoint(data){
			console.log("draw LinePoint");
			ctx.fillStyle = "red";
			ctx.beginPath();
			var i = 0;
			for(var d of data){
				var p = this.d2l(d);
				if(i==0)ctx.moveTo(p.x, p.y);
				else ctx.lineTo(p.x, p.y);
				i++;
			}
			ctx.stroke();
			for(var d of data){
				var p = this.d2l(d);
				ctx.beginPath();
				ctx.arc(p.x,p.y,3, 0, 2.0*Math.PI);
				ctx.fill();
			}
		}

		drawBorder(){
			console.log("draw border");
			ctx.strokeStyle = "black";
			ctx.rect(this.location.x, this.location.y-this.size.y, this.size.x, this.size.y);
			ctx.stroke();
		}

		drawGrid(){
			console.log("draw grid");
			ctx.strokeStyle = "gray";
			for(var i=0; i<10; i++){
				var x = this.range.xmin + this.range.xdistance/10*i;
				ctx.beginPath();
				ctx.moveTo(x*this.dtl.x + this.location.x, this.location.y);
				ctx.lineTo(x*this.dtl.x + this.location.x, this.location.y - this.size.y);
				ctx.stroke();
			}	
			for(var i=0; i<10; i++){
				var y = this.range.ymin + this.range.ydistance/10*i;
				ctx.beginPath();
				ctx.moveTo(this.location.x            , -y*this.dtl.y + this.location.y);
				ctx.lineTo(this.location.x+this.size.x, -y*this.dtl.y + this.location.y);
				ctx.stroke();
			}	
		}

		drawTics(xtics, ytics){
			console.log("draw tics");
			for(var x=this.range.xmin; x<this.range.xmax; x+=xtics){
				ctx.beginPath();
				ctx.moveTo(x*this.dtl.x,0);
				ctx.lineTo(x*this.dtl.x,3);
				ctx.stroke();
			}
			for(var x=this.range.xmin; x<=this.range.xmax; x+=this.range.xdistance/xtics){
				ctx.fillText(x.toFixed(2), this.location.x+x*this.dtl.x, this.location.y)
			}
			for(var y=this.range.ymin; y<=this.range.ymax; y+=this.range.ydistance/ytics){
				ctx.fillText(y.toFixed(2), this.location.x, this.location.y-y*this.dtl.y)
			}
		}

	}

	var graph = new Graph(25, 220, 440, 210, range, grid);
	graph.drawGrid();
	graph.drawBorder();
	graph.drawTics(1,1);

	class Param{
		constructor(C, R, E){
			this.C = C;
			this.R = R;
			this.E = E;
		}
	}

	class Dynanmics{
		constructor(N, x0, param){
			this.N = N;
			this.t = 0;
			this.x = x0; //list
			this.param = param;
			this.dt = 0.05;
		}

		func(n, t, x){
			var C = this.param.C;
			var R = this.param.R;
			var E = this.param.E;
			var dxdt;
			if(n==0){
				dxdt =(E-x[0]);
				//dxdt = x[0];
				//dxdt = 1.0;
			}
			else if(n==1){
				dxdt = 0;
			}
			else{
				dxdt = 0;
			}
			return dxdt;
		}

		runge(t, x){ //proceed 1 step
			var k1 = [];
			var k2 = [];
			var k3 = [];
			var k4 = [];
			var k = [];
			var dt = this.dt;
			var tmpx = this.x;
			for(var i = 0; i<this.N; i++) {
				k1[i] = dt*this.func(i, this.t, tmpx);
				tmpx[i] += k1[i]/2.0;
			}
			for(var i = 0; i<this.N; i++) {
				k2[i] = dt*this.func(i, this.t+dt/2.0, tmpx);
				tmpx[i] += k2[i]/2.0
			}
			for(var i = 0; i<this.N; i++) {
				k3[i] = dt*this.func(i, this.t+dt/2.0, tmpx);
				tmpx[i] += k3[i];
			}
			for(var i = 0; i<this.N; i++) {
				k4[i] = dt*this.func(i, this.t+dt, tmpx);
			}
			for(var i = 0; i<this.N; i++) k[i] = (k1[i] + 2.0*(k2[i]+k3[i]) + k3[i]) / 6.0;
			for(var i = 0; i<this.N; i++) this.x[i] += k[i];
			this.t += dt;
		}
	}

	var x0 = [0.1];
	var param = new Param(0.47e-6, 100000.0, 15);
	var dyn = new Dynanmics(1, x0, param);
	for(var i=0; i<50; i++){
		dyn.runge();
		graph.addPoint(new Point(dyn.t, dyn.x[0]));
	}
	graph.drawLinePoint(graph.data);
	console.log(graph);


	function keydown(event) {
		//inhibit scrolling
		event.preventDefault();

		//switch the target
		if(event.keyCode == 32){ //space key
		}
		
		//move

		if(event.keyCode == 37) { //left

		}
		if(event.keyCode == 38){ //up key

		}
		if(event.keyCode == 39) { //right key

		}
		if(event.keyCode == 40) { //down key

		}
		if(37<=event.keyCode && event.keyCode<=40){

		}

		//draw
		redraw();
		
		//animate
		if(event.keyCode == 13){ //enter key
			animateflag = 1 - animateflag;
			if(animateflag)console.log("start animating!");
			else console.log("stop animating.");
		}
	}

	function redraw(){
		//draw
		ctx.clearRect(0,0,width,height); //clear
		graph.style="lp";
		graph.draw();

	}

	var animateflag = 0
	function animate(){
		if(!animateflag) return;

		redraw();
	}

	redraw();
	setInterval(animate, 80);


		

})();