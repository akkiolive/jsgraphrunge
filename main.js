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

	var data = [];
	for(var i = 0; i<3; i+=0.2) data.push(new Point(i, i*i));

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
			constructor(style=1){
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

		setStyle(){

		}

		addData(data){
			console.log("add data.");
			for(var d of data) this.data.push(d);
			var mini = findmin(data);
			var maxi = findmax(data);
			this.range = new Range(data[mini].x, data[mini].y, data[maxi].x, data[maxi].y);
			this.dtl.x = this.size.x / this.range.xdistance;
			this.dtl.y = this.size.y / this.range.ydistance;
			this.ltd.x = 1.0 / this.dtl.x;
			this.ltd.y = 1.0 / this.dtl.y;
			this.originingraph.x  = -this.range.xmin*this.dtl.x;
			this.originingraph.y  = -this.range.ymin*this.dtl.y;
		}

		draw(data){
			for(var d of data) this.data.push(d);
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

		drawBorder(){
			console.log("draw border");
			ctx.strokeStyle = "black";
			ctx.rect(this.location.x, this.location.y-this.size.y, this.size.x, this.size.y);
			ctx.stroke();
		}

		drawGrid(){
			console.log("draw grid");
			ctx.strokeStyle = "gray";
			for(var i=0; i<=10; i++){
				var x = this.range.xmin + this.range.xdistance/10*i;
				ctx.beginPath();
				ctx.moveTo(x*this.dtl.x + this.location.x, this.location.y);
				ctx.lineTo(x*this.dtl.x + this.location.x, this.location.y - this.size.y);
				ctx.stroke();
			}	
			for(var i=0; i<=10; i++){
				var y = this.range.ymin + this.range.ydistance/10*i;
				ctx.beginPath();
				ctx.moveTo(this.location.x            , -y*this.dtl.y + this.location.y);
				ctx.lineTo(this.location.x+this.size.x, -y*this.dtl.y + this.location.y);
				ctx.stroke();
			}	
		}

		drawTics(xtics, ytics){
			console.log("draw tics");
			for(var x=this.range.xmin; x<=this.range.xmax; x+=xtics){
				ctx.beginPath();
				ctx.moveTo(x*this.dtl.x,0);
				ctx.lineTo(x*this.dtl.x,3);
			}
		}

	}

	var graph = new Graph(25, 220, 440, 210, range, grid);
	graph.addData(data);
	console.log(graph);
	graph.drawGrid();
	graph.drawBorder();
	graph.drawTics(1,1);
	graph.drawPoint(new Point(2, 4))
	for(var d of data){
		graph.drawPoint(d);
	}

	class Runge{
		constructor(){

		}
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
		//ctx.clearRect(0,0,width,height); //clear

	}

	var animateflag = 0
	function animate(){
		if(!animateflag) return;

		redraw();
	}

	redraw();
	setInterval(animate, 80);


		

})();