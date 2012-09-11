
function CanvasViewer(board, view_canvas, tmp_canvas,viewerWidth, viewerHeight,id){
		this.view_canvas = view_canvas;
		this.tmp_canvas = tmp_canvas;
		this.id = id;
		this.board = board;
		this.boardAngle = 0;
		if(this.view_canvas)
			this.main_ctx = this.view_canvas.getContext('2d');
		if(this.tmp_canvas)
			this.tmp_ctx = this.tmp_canvas.getContext('2d');
			
		this.innerCanvas = document.createElement('canvas');
		this.innerCanvasCtx = this.innerCanvas.getContext('2d');;
		this.innerCanvas.width = viewerWidth;
		this.innerCanvas.height = viewerHeight;
		this.rspacing = 1;
		this.cspacing = 1;
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
		if(this.view_canvas)
			this.padding = parseInt(jQuery(this.view_canvas).css('padding').replace('px',''));
		else
			this.padding=0;
		var self = this;
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
			evt._x = x-self.padding;
			evt._y = y-self.padding;
			return {
			  x: evt._x,
			  y: evt._y
			};
		}
		this.bindEvents = function(){
			var  $div = this.board;
			var self = this;
			console.log('Event: tool selected is: '+ self.tool);
			$div.unbind();
			$div.bind('mousewheel',function(ev, delta) {
				var event = ev.originalEvent;
				ev.preventDefault();
				ev.stopPropagation();
				var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;				
				switch(self.tool.name){
					case 'none':
						self.zoomImage(delta > 0 ? false : true);
						break;
					default:
						var func = self.tool[event.type];
						if (func) {
						  console.log('mouse wheel');
						  func.call(self.tool,event,delta);
						}
						break;
				}
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
						  func.call(self.tool,event,self.tmp_ctx,self.tmp_canvas);
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
						  var callback;
						  if(self.tool.name=='line'){
							callback = self.lineWidthCallback.bind(self);
						  }else if(self.tool.name=='rect'){
							callback = self.rectWidthCallback.bind(self);
						  }
						  func.call(self.tool,event,self.tmp_ctx,self.tmp_canvas,callback);
						  if(self.tool.name=='line'||self.tool.name=='rect'||self.tool.name=='pencil')
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
						var callback;
						if (func) {
						  if(self.tool.name=='line'){
							callback = self.lineWidthCallback.bind(self);
						  }else if(self.tool.name=='rect'){
							callback = self.rectWidthCallback.bind(self);
						  }
						  func.call(self.tool,event,self.tmp_ctx,self.tmp_canvas,callback);
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
CanvasViewer.prototype.lineWidthCallback = function(x0,y0,x1,y1){
	console.log("calling drawtext");
	var distance = this.getDistance(x0,y0,x1,y1)/10;
	this.tmp_ctx.font = "10pt Arial";
	this.tmp_ctx.fillText(distance.toFixed(3)+" cm",x0,y0);
}
CanvasViewer.prototype.rectWidthCallback = function(x,y,w,h){
	console.log("calling drawtext");
	var area = this.getArea(w,h)/100;
	this.tmp_ctx.font = "10pt Arial";
	this.tmp_ctx.fillText(area.toFixed(3)+" cm^2",x+w,y+h);
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
CanvasViewer.prototype.init = function(drawImage){
	this.visibleSize.w = this.view_canvas.width*this.zoom;
	this.visibleSize.h = this.view_canvas.height*this.zoom;
	this.imageOrigin.x = this.innerCanvas.width/2 - this.view_canvas.width/2;
	this.imageOrigin.y = this.innerCanvas.height/2 - this.view_canvas.height/2;
	
	if(this.imageOrigin.x<0){
		this.imageOrigin.x = 0;
	}
	if(this.imageOrigin.y < 0){
		this.imageOrigin.y = 0;
	}
	
	this.bindEvents();
	
	if(drawImage===false)
		return;
	
	this.draw();
}
CanvasViewer.prototype.changeSurface=function(board, view_canvas, tmp_canvas, drawImage){
	this.view_canvas = view_canvas;
	this.tmp_canvas = tmp_canvas;
	this.board = board;
	this.main_ctx = this.view_canvas.getContext('2d');
	this.tmp_ctx = this.tmp_canvas.getContext('2d');
	this.visibleSize={w:0,h:0};
	this.imageOrigin = {x:0,y:0};
	this.zoom = 0.99;
	this.canZoom = true;
	this.init(drawImage);
}
CanvasViewer.prototype.rotate=function(angle){
	this.boardAngle+=angle;
	this.draw();
}
CanvasViewer.prototype.rotateLayer=function(layerName, angle){
	var layer = null;
	for(var i = 0; i< this.layers.length; i++){
		if(layerName == this.layers[i].getName()){
			layer = this.layers[i]
			break;
		}
	}
	if(layer==null){return false;}
	layer.rotate(angle);
	this.draw();
	return true;
}
CanvasViewer.prototype.flipLayer=function(layerName,horizontal){
	var layer = null;
	for(var i = 0; i< this.layers.length; i++){
		if(layerName == this.layers[i].getName()){
			layer = this.layers[i]
			break;
		}
	}
	if(layer==null){return false;}
	if(horizontal===true){
		layer.flipHorizontal();
	}else{
		layer.flipVertical();
	}
	this.draw();
	return true;
}
CanvasViewer.prototype.setTool=function(toolname){
	var self = this;
	console.log('setting tool'+toolname);
	if(toolname in tools){
		this.tool = new tools[toolname];
		this.tool.self = self;
	}else{
		console.log('registering new tool');
		tools[toolname] = function () {
			var tool = this;
			this.started = false;
			this.name = toolname;
			this.self = self;
			this.invoke = function(ev,delta){
				for(var i =0; i<this.self.layers.length; i++){
					var layer = this.self.layers[i];
					var func = layer[toolname];
					if (func) {
					  func.call(this.self,ev,delta);
					}
				}
			};
			// This is called when you start holding down the mouse button.
			// This starts the pencil drawing.
			this.mousedown = function (ev,context) {
				tool.started = true;
				tool.invoke(ev);
			};
			
			this.mousewheel = function(ev, delta) {
				tool.invoke(ev,delta);
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
CanvasViewer.prototype.drawChezBackground = function(){
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
CanvasViewer.prototype.drawBackground = function(){
	this.innerCanvasCtx.fillStyle = "black";
	this.innerCanvasCtx.fillRect (0,0,this.innerCanvas.width,this.innerCanvas.height);
}
CanvasViewer.prototype.clearDrawings = function(){
	console.log('clearing drawings');
	this.innerCanvasDrawingsCtx.clearRect(0, 0, this.innerCanvasDrawings.width, this.innerCanvasDrawings.height);
	this.draw();
}
CanvasViewer.prototype.draw = function(){
	console.log("calling draw on:"+this.id);
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
	var y = this.innerCanvas.height/2;
	var x = this.innerCanvas.width/2;
	var canvas_angle = this.boardAngle*Math.PI/180;
	this.innerCanvasCtx.translate(x,y);
	this.innerCanvasCtx.rotate(canvas_angle);
	this.innerCanvasCtx.translate(-x,-y);
	for(var i =0; i<this.layers.length; i++){
		var layer = this.layers[i];
		this.innerCanvasCtx.drawImage(layer.getCanvas(),layer.getX(),layer.getY(),layer.getWidth(),layer.getHeight());
	}
	this.innerCanvasCtx.drawImage(this.innerCanvasDrawings,0,0);
	
	this.innerCanvasCtx.translate(x,y);
	this.innerCanvasCtx.rotate(-canvas_angle);
	this.innerCanvasCtx.translate(-x,-y);
	
	this.main_ctx.drawImage(this.innerCanvas,this.imageOrigin.x,this.imageOrigin.y,this.visibleSize.w,this.visibleSize.h,0,0,this.view_canvas.width,this.view_canvas.height);
}
CanvasViewer.prototype.setCalibration = function(rowspace, colspace){
	this.rspacing = rowspace;
	this.cspacing = colspace;
	console.log("setCalibration: "+this.rspacing+" : "+this.cspacing);
}
CanvasViewer.prototype.getArea = function(w,h){
	var wa = w*this.cspacing;
	var ha = h*this.rspacing;
	return wa*ha;	
}
CanvasViewer.prototype.getDistance = function(x0,y0,x1,y1){
	var deltax = (x0-x1)*this.cspacing;
	var deltay = (y0-y1)*this.rspacing;
	var d = Math.sqrt(Math.pow(deltax,2)+Math.pow(deltay,2));
	return d;
}