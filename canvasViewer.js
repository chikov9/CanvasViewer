
function CanvasViewer(stage,container,id,eventsUtils){
		if(stage){
			this.id = id;
			this.bindedFunctions = {'mousewheel':[],'mousedown':[],'mouseup':[],'mousemove':[]}
			this.rspacing = 1;
			this.cspacing = 1;
			this.mouseIsDown = false;
			this.mouseStart=[];
			this.tool = new tools['none'];
			this.stage = stage;
			this.layer = this.stage.get('#drawinglayer')[0];
			this.container = $(container);
			this.eventsUtils = eventsUtils;
			var self = this;
			this.bindEvents = function(){
				var  $div = this.board;
				var self = this;
				console.log('Event: tool selected is: '+ self.tool);
				self.container.unbind();
				self.container.bind('mousewheel',function(ev, delta) {
					var event = ev.originalEvent;
					ev.preventDefault();
					ev.stopPropagation();
					var delta = event.wheelDelta ? event.wheelDelta/40 : event.detail ? -event.detail : 0;				
					for(var i = 0; i<self.bindedFunctions['mousewheel'].length;i++){
						self.bindedFunctions['mousewheel'][i].call(self,event);
					}
					switch(self.tool.name){
						case '':
						case 'none':
							var zoomAmount = event.wheelDeltaY*0.001;
							self.layer.setScale(self.layer.getScale().x+zoomAmount)
						  	self.layer.draw();
							break;
						default:
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse wheel');
							  func.call(self.tool,event,self.stage,self.layer,delta);
							}
							break;
					}
				});
				self.stage.off('mousedown');
				self.stage.on('mousedown',function(event, delta) {
					for(var i = 0; i<self.bindedFunctions['mousedown'].length;i++){
						self.bindedFunctions['mousedown'][i].call(self,event);
					}
					switch(self.tool.name){
						case 'none':
							break;
						default:
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse down');
							  func.call(self.tool,event,self.stage,self.layer);
							}
							break;
					}
				});
				self.stage.off('mouseup');
				self.stage.on('mouseup',function(event, delta) {
					for(var i = 0; i<self.bindedFunctions['mouseup'].length;i++){
						self.bindedFunctions['mouseup'][i].call(self,event);
					}
					switch(self.tool.name){
						case 'none':
							break;
						default:
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse up');
							  func.call(self.tool,event,self.stage,self.layer);
							}
							break;
					}
				});
				self.stage.off('mousemove');
				self.stage.on('mousemove',function(event, delta) {
					for(var i = 0; i<self.bindedFunctions['mousemove'].length;i++){
						self.bindedFunctions['mousemove'][i].call(self,event);
					}
					switch(self.tool.name){
						case 'none':
							break;
						default:
							var func = self.tool[event.type];
							if (func) {
							  func.call(self.tool,event,self.stage,self.layer);
							}
							break;
					}
				});
				
				self.container.bind("contextmenu", function(e) {
					return false;
				});
			}
			this.bindEvents();
		}
}

CanvasViewer.prototype.bind=function(eventname,func){
	if(eventname in this.bindedFunctions){
		this.bindedFunctions[eventname].push(func);
	}
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
			this.invoke = function(ev,stage,layer,delta){
				var func = this.self.eventsUtils[toolname];
				if (func) {
				  func.call(this.self,ev,stage,layer,delta);
				}
			};
			// This is called when you start holding down the mouse button.
			// This starts the pencil drawing.
			this.mousedown = function (ev,stage,layer) {
				tool.started = true;
				tool.invoke(ev, stage,layer);
			};
			
			this.mousewheel = function(ev, stage,layer,delta) {
				tool.invoke(ev, stage,layer ,delta);
			};

			// This function is called every time you move the mouse. Obviously, it only 
			// draws if the tool.started state is set to true (when you are holding down 
			// the mouse button).
			this.mousemove = function (ev,stage,layer) {
			  if (tool.started) {
				console.log(ev._x+" "+ev._y);
				tool.invoke(ev, stage,layer);
			  }
			};

			// This is called when you release the mouse button.
			this.mouseup = function (ev, stage,layer) {
			  if (tool.started) {
				tool.invoke(ev, stage,layer);
				tool.started = false;
			  }
			};
		};
		this.tool = new tools[toolname];
		this.tool.self = self;
	}
}
CanvasViewer.prototype.drawBackgroundImage = function(x, y, imageW, imageH,newCanvas){
	var image = this.layer.get('#imagebg')[0];
	if(image){
		image.setDrawFunc(function(context) {
	        context.drawImage(newCanvas,x, y, imageW, imageH);
	    });
	}else{
		image = new Kinetic.Shape({
	      drawFunc: function(context) {
	        context.drawImage(newCanvas,x, y, imageW, imageH);
	      },
	      fill: "#00D2FF",
	      stroke: "black",
	      strokeWidth: 4,
	      id:'imagebg'
	    });
	    this.layer.add(image);
	}
    this.layer.draw();
    image.moveToBottom();
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
CanvasViewer.prototype.rotate=function(angle){
	throw('unimplemented')
}
CanvasViewer.prototype.draw = function(){
	throw('unimplemented')
}
CanvasViewer.prototype.getPixel=function(x,y){
	throw('unimplemented')
}
CanvasViewer.prototype.drawBackground = function(){
	throw('unimplemented')
}
CanvasViewer.prototype.clearDrawings = function(){
	
}
CanvasViewer.prototype.changeSurface=function(){
	
}
CanvasViewer.prototype.save = function(){

}