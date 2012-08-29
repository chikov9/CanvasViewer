
function CanvasViewer(board, view_canvas, tmp_canvas,viewerWidth, viewerHeight){
		this.view_canvas = view_canvas;
		this.tmp_canvas = tmp_canvas;
		this.board = board;
		this.main_ctx = this.view_canvas.getContext('2d');
		this.tmp_ctx = this.tmp_canvas.getContext('2d');
		this.innerCanvas = document.createElement('canvas');
		this.innerCanvasCtx = this.innerCanvas.getContext('2d');;
		this.innerCanvas.width = viewerWidth;
		this.innerCanvas.height = viewerHeight;
		
		this.innerCanvasDrawings = document.createElement('canvas');
		this.innerCanvasDrawingsCtx = this.innerCanvasDrawings.getContext('2d');;
		this.innerCanvasDrawings.width = viewerWidth;
		this.innerCanvasDrawings.height = viewerHeight;
		
		this.mouseIsDown = false;
		this.mouseStart=[];
		this.visibleSize={w:0,h:0};
		this.imageOrigin = {x:0,y:0};
		this.zoom = 0.99;
		this.canZoom = true;
		this.zoom_step = 0.03;
		this.tool = new tools['none'];
		this.layers=[];
		
		this.getMousePos = function(evt) {
			var x, y;
			if (evt.layerX || evt.layerX == 0) { // Firefox
			  x = evt.layerX;
			  y = evt.layerY;
			} else if (evt.offsetX || evt.offsetX == 0) { // Opera
			  x = evt.offsetX;
			  y = evt.offsetY;
			}
			// return relative mouse position
			evt._x = x;
			evt._y = y;
			return {
			  x: evt._x,
			  y: evt._y
			};
		}
		this.bindEvents = function(){
			var  $div = this.board;
			var self = this;
			$div.bind('mousewheel',function(ev, delta) {
				var event = ev.originalEvent;
				ev.preventDefault();
				ev.stopPropagation();
				var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;				
				self.zoomImage(delta > 0 ? false : true);
			});
			$div.mousedown(function(event, delta) {
				event.preventDefault();
				event.stopPropagation();
				self.getMousePos(event);
				self.mouseIsDown = true;
				self.mouseStart[0]=event._x;
				self.mouseStart[1]=event._y;
				switch(self.tool.name){
					case 'none':
						break;
					default:
						var func = self.tool[event.type];
						if (func) {
						  console.log('mouse down');
						  func(event,self.tmp_ctx,self.tmp_canvas);
						}
						break;
				}
			});
			$div.mouseup(function(event, delta) {
				event.preventDefault();
				event.stopPropagation();
				self.getMousePos(event);
				self.mouseIsDown = false;
				switch(self.tool.name){
					case 'none':
						break;
					default:
						var func = self.tool[event.type];
						if (func) {
						  console.log('mouse up');
						  func(event,self.tmp_ctx,self.tmp_canvas);
						  self.projectDraw();
						}
						break;
				}
			});
			$div.mousemove(function(event, delta) {
				event.preventDefault();
				event.stopPropagation();
				if(!self.mouseIsDown)
					return false;
				self.getMousePos(event);
				var delta={};
				delta.x = event._x - self.mouseStart[0];
				delta.y = event._y - self.mouseStart[1];
				switch(self.tool.name){
					case 'none':
						self.translateImage(delta);
						break;
					default:
						var func = self.tool[event.type];
						if (func) {
						  console.log('drawing line');
						  func(event,self.tmp_ctx,self.tmp_canvas);
						}
						break;
				}
				
				self.mouseStart[0]=event._x;
				self.mouseStart[1]=event._y;
			});
			
			$div.bind("contextmenu", function(e) {
				return false;
			});
		}
}

CanvasViewer.prototype.zoomImage = function(zoomOut){
	if(zoomOut){
		if(!this.canZoom)
			return;
		this.zoom +=this.zoom_step;
		console.log("zooming out:",this.zoom);
	}else{
		this.canZoom = true;
		this.zoom -=this.zoom_step;
		console.log("zooming in:",this.zoom);
	}
	this.visibleSize.w = this.view_canvas.width*this.zoom;
	this.visibleSize.h = this.view_canvas.height*this.zoom;
	this.draw();
}

CanvasViewer.prototype.projectDraw = function(){
	this.innerCanvasDrawingsCtx.drawImage(this.tmp_canvas,0,0,this.tmp_canvas.width,this.tmp_canvas.height,this.imageOrigin.x,this.imageOrigin.y,this.visibleSize.w,this.visibleSize.h);
	this.tmp_ctx.clearRect(0, 0, this.tmp_canvas.width, this.tmp_canvas.height);
	this.innerCanvasCtx.drawImage(this.innerCanvasDrawings,0,0);
	this.main_ctx.drawImage(this.innerCanvas,this.imageOrigin.x,this.imageOrigin.y,this.visibleSize.w,this.visibleSize.h,0,0,this.view_canvas.width,this.view_canvas.height);
}

CanvasViewer.prototype.translateImage = function(delta){
	this.imageOrigin.x = this.imageOrigin.x - delta.x;
	this.imageOrigin.y = this.imageOrigin.y - delta.y;
	if(this.imageOrigin.x<0){
		this.imageOrigin.x = 0;
	}else if(this.innerCanvas.width - this.imageOrigin.x < this.visibleSize.w){
		this.imageOrigin.x = this.innerCanvas.width - this.visibleSize.w;
	}
	
	if(this.imageOrigin.y < 0){
		this.imageOrigin.y = 0;
	}else if(this.innerCanvas.height - this.imageOrigin.y < this.visibleSize.h){
		this.imageOrigin.y = this.innerCanvas.height - this.visibleSize.h;
	}
	this.draw();
}
CanvasViewer.prototype.init = function(){
	this.visibleSize.w = this.view_canvas.width*this.zoom;
	this.visibleSize.h = this.view_canvas.height*this.zoom;
	this.imageOrigin.x = this.innerCanvas.width/2 - this.view_canvas.width/2;
	this.imageOrigin.y = this.innerCanvas.height/2 - this.view_canvas.height/2;
	this.draw();
	this.bindEvents();
}
CanvasViewer.prototype.changeSurface=function(board, view_canvas, tmp_canvas){
	this.view_canvas = view_canvas;
	this.tmp_canvas = tmp_canvas;
	this.board = board;
	this.main_ctx = this.view_canvas.getContext('2d');
	this.tmp_ctx = this.tmp_canvas.getContext('2d');
	this.visibleSize={w:0,h:0};
	this.imageOrigin = {x:0,y:0};
	this.zoom = 0.99;
	this.canZoom = true;
	this.init();
}
CanvasViewer.prototype.setTool=function(toolname){
	var self = this;
	if(toolname in tools){
		this.tool = new tools[toolname];
	}else{
		console.log('registering new tool');
		tools[toolname] = function () {
			var tool = this;
			this.started = false;
			this.name = toolname;
			this.invoke = function(ev){
				for(var i =0; i<self.layers.length; i++){
					var layer = self.layers[i];
					var func = layer[ev.type];
					if (func) {
					  func(ev);
					}
				}
			}
			// This is called when you start holding down the mouse button.
			// This starts the pencil drawing.
			this.mousedown = function (ev,context) {
				tool.started = true;
				tool.invoke(ev);
			};

			// This function is called every time you move the mouse. Obviously, it only 
			// draws if the tool.started state is set to true (when you are holding down 
			// the mouse button).
			this.mousemove = function (ev,context) {
			  if (tool.started) {
				console.log(ev._x+" "+ev._y);
				tool.invoke(ev);
			  }
			};

			// This is called when you release the mouse button.
			this.mouseup = function (ev,context) {
			  if (tool.started) {
				tool.invoke(ev);
				tool.started = false;
			  }
			};
		};
		this.tool = new tools[toolname];
	}
}
CanvasViewer.LAYOUT_CENTER = 0;
CanvasViewer.prototype.addLayer = function(layer,layout){ //layout 0=center, 1=top, 2=left, 3=right, 4=bottom
	if(layout===CanvasViewer.LAYOUT_CENTER){
		layer.setX(layer.getX()+this.innerCanvas.width/2 - this.view_canvas.width/2);
		layer.setY(layer.getY()+this.innerCanvas.height/2 - this.view_canvas.height/2);
	}else{
		layer.setX(layer.getX()+this.imageOrigin.x);
		layer.setY(layer.getY()+this.imageOrigin.y);	
	}
	for(var i = 0; i< this.layers.length; i++){
		if(layer.getName() == this.layers[i].getName()){
			this.layers[i] = layer;
			this.draw();
			return;
		}
	}
	this.layers.push(layer);
	this.draw();
}
CanvasViewer.prototype.drawBackground = function(){
	var countA = 0;
	for(var i = 0; i < this.innerCanvas.width; i+=20){
		var countB = 0;
		for(var j = 0; j < this.innerCanvas.height; j+=20){
			if(j==0 || i==0 || j+20 >= this.innerCanvas.height || i+ 20 >= this.innerCanvas.width){
				this.innerCanvasCtx.fillStyle = "black";
			}else if(countA%2==0){
				if(countB%2==0){
					this.innerCanvasCtx.fillStyle = "#E5E5E5";
				}else{
					this.innerCanvasCtx.fillStyle = "white";
				}
			}else{
				if(countB%2==0){
					this.innerCanvasCtx.fillStyle = "white";
				}else{
					this.innerCanvasCtx.fillStyle = "#E5E5E5";
				}
			}
			this.innerCanvasCtx.fillRect (i,j,20,20);
			countB++;
		}
		countA++;
	}
}
CanvasViewer.prototype.clearDrawings = function(){
	console.log('clearing drawings');
	this.innerCanvasDrawingsCtx.clearRect(0, 0, this.innerCanvasDrawings.width, this.innerCanvasDrawings.height);
	this.draw();
}
CanvasViewer.prototype.draw = function(){
	if(this.imageOrigin.x+this.visibleSize.w > this.innerCanvas.width){
		this.imageOrigin.x -= (this.imageOrigin.x+this.visibleSize.w) - this.innerCanvas.width;
		if(this.imageOrigin.x < 0){
			this.imageOrigin.x=0;
			this.visibleSize.w = this.innerCanvas.width;
			this.canZoom = false;
		}
	}
	if(this.imageOrigin.y+this.visibleSize.h > this.innerCanvas.height){
		this.imageOrigin.y -= (this.imageOrigin.y+this.visibleSize.h) - this.innerCanvas.height;
		if(this.imageOrigin.y < 0){
			this.imageOrigin.y=0;
			this.visibleSize.h = this.innerCanvas.height;
			this.canZoom = false;
		}
	}
	
	this.innerCanvasCtx.clearRect(0, 0, this.innerCanvas.width, this.innerCanvas.height);
	this.drawBackground();
	for(var i =0; i<this.layers.length; i++){
		var layer = this.layers[i];
		this.innerCanvasCtx.drawImage(layer.getCanvas(),layer.getX(),layer.getY(),layer.getWidth(),layer.getHeight());
	}
	this.innerCanvasCtx.drawImage(this.innerCanvasDrawings,0,0);
	
	this.main_ctx.drawImage(this.innerCanvas,this.imageOrigin.x,this.imageOrigin.y,this.visibleSize.w,this.visibleSize.h,0,0,this.view_canvas.width,this.view_canvas.height);
	this.main_ctx.fillStyle = "rgb(150,29,28)";
    this.main_ctx.fillRect (10,10,20,20);
	this.main_ctx.strokeStyle = "red";
    this.main_ctx.strokeRect (30,30,20,20);
	this.main_ctx.strokeStyle = "red";
    this.main_ctx.strokeRect (0,0,this.tmp_canvas.width,this.tmp_canvas.height);
}