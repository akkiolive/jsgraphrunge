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
			this.original = this;
		}

		reset(){
			//this = this.original;
			this.location = this.original.location;
			this.size = this.original.size;
			this.range = this.original.range;
			this.grid = this.original.grid;
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
			if(this.data.length==0){
				console.log("graph has no data so fail renewing");
				return;
			}
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
			//console.log("add point -> ("+point.x+", "+point.y+")");
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

		l2d(point){
			var x = (point.x - this.originingraph.x - this.location.x)/ this.dtl.x;
			var y = (-point.y - this.originingraph.y + this.location.y)/ this.dtl.y;
			return new Point(x,y);
		}

		delPrevPoint(){
			delete this.data[this.data.length-1];
		}

		drawPoint(point){
			var x = point.x * this.dtl.x + this.originingraph.x + this.location.x;
			var y = -point.y * this.dtl.y + this.originingraph.y + this.location.y;
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.arc(x,y,3, 0, 2.0*Math.PI);
			ctx.fill();
			//console.log("draw point -> ("+x+","+y+")");
		}

		drawLinePoint(data){
			//console.log("draw LinePoint");
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
			//console.log("draw border");
			ctx.strokeStyle = "black";
			ctx.rect(this.location.x, this.location.y-this.size.y, this.size.x, this.size.y);
			ctx.stroke();
		}

		drawGrid(){
			//console.log("draw grid");
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
			//console.log("draw tics");
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
		constructor(r){
			this.r = r;
		}
	}

	class Dynanmics{
		constructor(N, x0, param){
			this.N = N;
			this.t = 0;
			this.x = x0; //list
			this.param = param;
			this.dt = 0.05;
			console.log(this.func);
		}

		func(n, t, x){
			var r = this.param.r;
			var dxdt = [];
			var xx = x[0];
			var y = x[1];
			var z = x[2];
			console.log(xx);
			if(n==0){
				dxdt[0] = -10*xx + 10*y;
				dxdt[1] = -xx*z + r*xx - y;
				dxdt[2] = xx*y - 8/3*z;
				//dxdt[0] = xx + 3;
				//dxdt[1] = xx;
				//dxdt[2] = Math.sin(t*z);
			}
			else if(n==1){
				dxdt = 0;
			}
			else{
				dxdt = 0;
			}
			return dxdt;
		}

		runge(n){ //proceed 1 step
			var k1 = [];
			var k2 = [];
			var k3 = [];
			var k4 = [];
			var k = [];
			var dt = this.dt;
			var tmpx = this.x;
			k1 = this.func(n, this.t, tmpx);
			for(var i = 0; i<this.N; i++) {
				tmpx[i] += dt*k1[i]/2.0;
			}
			k2 = this.func(n, this.t+dt/2.0, tmpx);
			for(var i = 0; i<this.N; i++) {
				tmpx[i] += dt*k2[i]/2.0
			}
			k3 = this.func(n, this.t+dt/2.0, tmpx);
			for(var i = 0; i<this.N; i++) {
				tmpx[i] += dt*k3[i];
			}
			k4 = this.func(n, this.t+dt, tmpx);
			for(var i = 0; i<this.N; i++) k[i] = dt*(k1[i] + 2.0*(k2[i]+k3[i]) + k3[i]) / 6.0;
			for(var i = 0; i<this.N; i++) this.x[i] += k[i];
			this.t += dt;
		}
		
		read(){
			if(document.formf.inputf.value==""){
 				//document.getElementById("message").innerText = "no func!";
 				console.log("no func!");
 				return ;
			}
			var tf = function(n, t, x){
				var strf = document.formf.inputf.value;
				var strg = document.formf.inputg.value;
				var strh = document.formf.inputh.value;
				var dxdt = [];
				dxdt[0] = eval(strf);
				dxdt[1] = eval(strg);
				dxdt[2] = eval(strh);
				return dxdt;
			}	
			var xxx = [];
			for(var i=0; i<this.N; i++){
				xxx.push(i);
			}
			var test = tf(this.N, 0.05, xxx);
			console.log("test="+test);
			if(test==undefined) return	;
			this.func = tf;
			//console.log(this.x);
			//var val = this.func(0, 0, this.x);
			//console.log(val);
			console.log(this.func);
		}

		readparam(){
			console.log("read param!");
			var paramsname = [];
			var params = [];
			for(var i=0; i<document.formparam.elements.length/2-1; i++){
				paramsname[i] = document.formparam.elements[i*2].value;
				params[i] = Number(document.formparam.elements[i*2+1].value);
				if(paramsname[i]=="")continue;
				console.log(paramsname[i]+"="+params[i]);
				eval("this."+paramsname[i]+"="+params[i]);
			}
		}

	}

	var x0 = [1, 1, 1];
	var param = new Param(4); //r=28; diverged
	var dyn = new Dynanmics(3, x0, param);
	//	dyn.read();
	for(var i=0; i<50; i++){
		dyn.runge(0);
		if(dyn.x[1]!=NaN)graph.addPoint(new Point(dyn.x[0], dyn.x[1]));
		if(dyn.x[1]<0)dyn.x[1] = -dyn.x[1];
		console.log(new Point(dyn.x[0], dyn.x[1]));
	}
	graph.drawLinePoint(graph.data);
	console.log(graph);


 	stage.onclick = function(e) {
	    // 一度描画をクリア
	   // ctx.clearRect(0, 0, canvasW, canvasH);

	    // クリック位置の座標計算（canvasの左上を基準。-2ずつしているのはborderの分）
	    var rect = e.target.getBoundingClientRect();
	    var mouseX = e.clientX - Math.floor(rect.left) - 2;
	    var mouseY = e.clientY - Math.floor(rect.top) - 2;
	    var xyp = new Point(mouseX, mouseY);
	    var xy = graph.l2d(xyp);
	    console.log(xy);
	    graph.addPoint(xy);
	}

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

		if(event.keycode == 66) { //b key
			console.log("del prev Point");
			graph.delPrevPoint();
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

	var animateflag = 1;
	function animate(){
		if(!animateflag) return;

		redraw();
	}

	redraw();
	setInterval(animate, 300);

	var button = document.getElementById('inputfb');
	button.addEventListener('click', dyn.read);
	var buttonp = document.getElementById('inputparamb');
	buttonp.addEventListener('click', function(){
		dyn.readparam();
	});

	document.getElementById('drawb').addEventListener('click', function(){
		graph.draw();
	});

	document.getElementById('adddatab').addEventListener('click', function(){
		for(var i=0; i<50; i++){
			dyn.runge();
			graph.addPoint(new Point(dyn.t, dyn.x[0]));
		}
		graph.drawLinePoint(graph.data);
	});

	document.getElementById('resetb').addEventListener('click', function(){
		graph.reset();
		graph.draw();
	});

	document.getElementById('clearanddrawb').addEventListener('click', function(){
		dyn.read();
		graph.reset();
		console.log(dyn.func);
		dyn.t = 0;
		dyn.x = x0;
		for(var i=0; i<50; i++){
			dyn.runge();
			graph.addPoint(new Point(dyn.x[0], dyn.x[1]));
		}
		graph.drawLinePoint(graph.data);
		graph.draw();
	});

	document.getElementById('inputfid').addEventListener('input', function(){
		/*
		dyn.read();
		graph.reset();
		console.log(dyn.func);
		dyn.t = 0;
		for(var i=0; i<50; i++){
			dyn.runge();
			graph.addPoint(new Point(dyn.t, dyn.x[0]));
		}
		graph.drawLinePoint(graph.data);
		graph.draw();
		*/
	});


		

})();