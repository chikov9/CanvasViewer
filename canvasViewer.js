
function CanvasViewer(stages,stage,container,id,eventsUtils){
		if(stage){
			this.id = id;
			this.bindedFunctions = {'mousewheel':[],'mousedown':[],'mouseup':[],'mousemove':[]}
			this.rspacing = 1;
			this.cspacing = 1;
			this.mouseIsDown = false;
			this.mouseStart=[];
			this.tool = new tools['none'];
			this.stage = stage;
			this.stagesList = stages;
			this.layer = this.stage.get('#drawinglayer')[0];
			this.layerOverlay = stage.get('#overlaylayer')[0];
			this.container = $(container);
			this.eventsUtils = eventsUtils;
			this.OverlayTextTL==undefined;//top left
			this.OverlayTextTR==undefined; //top right
			this.OverlayTextBR==undefined; //bottom right
			this.OverlayTextBL==undefined; //bottom left
			this.backRuler == undefined;
			this.sideRuler == undefined;
			this.backRulerLines = [];
			this.sideRulerLines = [];
			this.mouse_position = { x:0, y: 0};

			this.bindEvents = function(viewer_mode){
				var self = this;
				var  $div = this.board;
				if(viewer_mode!=undefined){
					console.log("set binding tool ", viewer_mode);
					this.tool = new tools[viewer_mode];
					this.tool.self = this;
				}
				console.log('Event: tool selected is: '+ this.tool.name);
				this.container.unbind();
				this.container.bind('mouseover',function(ev){
					var event = ev.originalEvent;
					var $currentTarget = jQuery(event.currentTarget);
					var targetIdx = parseInt($currentTarget.attr('id').substring(7))-1;
					self.stage = self.stagesList[targetIdx]
					console.log(targetIdx);
					self.bindEvents();
				});
				this.container.bind('mousewheel',function(ev, delta) {
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
							self.tool = new tools['Browse'];
							self.tool.self = self;
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse wheel');
							  func.call(self.tool,event,self.stage,self.layer,delta);
							}
							self.tool.name='none';
							break;
						case 'zoom':
							var zoomAmount = event.wheelDeltaY*0.001;
							
							var cnvsPos = CanvasViewer.getPos(self.stage.content);
							console.log("mouse:", cnvsPos);
							var R={  
					            x: self.mouse_position.x,
					            y: self.mouse_position.y
					        }
					        console.log("position:",self.mouse_position);
					        var off0=self.layer.getPosition();
					        var scl0=self.layer.getScale().x;
					        var w=self.stage.getWidth();
					        var h=self.stage.getHeight();
					        var zP={
					            //use these first two lines to center the image on the clicked point while zooming
					            //x: w/2,
					            //y: h/2
					            //use these next two lines to zoom the image around the clicked point
					            x: R.x-cnvsPos.x,
					            y: R.y-cnvsPos.y                
					        }
					        var xA={
					            x:(R.x-off0.x-cnvsPos.x)/scl0,
					            y:(R.y-off0.y-cnvsPos.y)/scl0
					        }
					        var sclf = scl0+zoomAmount;
					        self._zoomRoller(sclf);
					        self.layer.setScale(sclf);
					        var newR={
					            x: zP.x-sclf*xA.x,
					            y: zP.y-sclf*xA.y
					        }
					        console.log("new:", newR);
							self.layer.setPosition(newR.x, newR.y)
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
				this.stage.off('mousedown');
				this.stage.on('mousedown',function(event, delta) {
					for(var i = 0; i<self.bindedFunctions['mousedown'].length;i++){
						self.bindedFunctions['mousedown'][i].call(self,event);
					}
					switch(self.tool.name){
						case '':
						case 'none':						
							self.tool = new tools['Window_Level'];
							self.tool.self = self;
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse down');
							  func.call(self.tool,event,self.stage,self.layer);
							}
							self.tool.name='none';
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
				this.stage.off('mouseup');
				this.stage.on('mouseup',function(event, delta) {
					for(var i = 0; i<self.bindedFunctions['mouseup'].length;i++){
						self.bindedFunctions['mouseup'][i].call(self,event);
					}
					switch(self.tool.name){
						case '':
						case 'none':
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse up');
							  func.call(self.tool,event,self.stage,self.layer);
							}
							break;
						case 'line':
							var func = self.tool[event.type];
							if (func) {
							  console.log('mouse up');
							  func.call(self.tool,event,self.stage,self.layer, self.lineCallback.bind(self));
							}
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
				this.stage.off('mousemove');
				this.stage.on('mousemove',function(event, delta) {
					self.mouse_position.x = event.pageX;
					self.mouse_position.y = event.pageY;
					for(var i = 0; i<self.bindedFunctions['mousemove'].length;i++){
						self.bindedFunctions['mousemove'][i].call(self,event);
					}
					switch(self.tool.name){
						case '':
						case 'none':
						    var func = self.tool[event.type];
							if (func) {
							  func.call(self.tool,event,self.stage,self.layer);
							}
							break;
						default:
							var func = self.tool[event.type];
							if (func) {
							  func.call(self.tool,event,self.stage,self.layer);
							}
							break;
					}
				});
				
				this.container.bind("contextmenu", function(e) {
					return false;
				});
			}
			this.bindEvents();
		}
}
CanvasViewer.getPos=function(el) {
    for (var lx=0, ly=0; el != null; el = el.offsetParent){
    	lx += el.offsetLeft, ly += el.offsetTop
    }
    return {x: lx,y: ly};
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
	if(this.bindEvents){
		console.log("rebinding events");
		this.bindEvents();
	}
}
CanvasViewer.prototype.refreshEvents = function(eventsList){
	this.eventsUtils = eventsList;
}
CanvasViewer.prototype.drawBackgroundImage = function(x, y, imageW, imageH,newCanvas,newstage,newcontainer,viewer_mode){
	if(newstage!=undefined){
		this.stage = newstage;
		this.container = newcontainer;
		this.bindEvents(viewer_mode);
	}
		
	this.layer = this.stage.get('#drawinglayer')[0];
	this.layerOverlay = this.stage.get('#overlaylayer')[0];
	var image = this.layer.get('#imagebg')[0];
	if(image){
		image.setDrawFunc(function(canvas) {
			context = canvas.getContext('2d');
	        context.drawImage(newCanvas,x, y, imageW, imageH);
	    });
	}else{
		image = new Kinetic.Shape({
	      fill: "#00D2FF",
	      stroke: "black",
	      strokeWidth: 4,
	      id:'imagebg'
	    });
	    image.setDrawFunc(function(canvas) {
	    	context = canvas.getContext('2d');
	        context.drawImage(newCanvas,x, y, imageW, imageH);
	    });
	    this.layer.add(image);
	}
	image.moveToBottom();
    this.layer.draw();
}
CanvasViewer.prototype.setCalibration = function(colspace,rowspace){
	this.rspacing = rowspace;
	this.cspacing = colspace;
	console.log("setCalibration: "+this.rspacing+" : "+this.cspacing);
}
CanvasViewer.prototype.getArea = function(w,h){
	var wa = w*this.cspacing;
	var ha = h*this.rspacing;
	return wa*ha;	
}
CanvasViewer.prototype.setScale = function(scale){
	console.log("Scale ",scale[0]," ",scale[1])
	this.scale = scale;
}
CanvasViewer.prototype.getDistance = function(x0,y0,x1,y1){
	var deltax = (x0-x1)*this.cspacing*this.scale[0];
	var deltay = (y0-y1)*this.rspacing*this.scale[1];
	var d = Math.sqrt(Math.pow(deltax,2)+Math.pow(deltay,2));
	return d;
}
CanvasViewer.prototype.lineCallback = function(x0,y0,x1,y1){
	console.log("calling drawtext");
	var distance = this.getDistance(x0,y0,x1,y1)/10;
	var simpleText = new Kinetic.Text({
        x: x1+10,
        y: y1+10,
        text: distance.toFixed(3)+" cm",
        fontSize: 20,
        fontFamily: 'Calibri light',
        stroke: 'red'
    });
	this.layer.add(simpleText);
	this.layer.draw();
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
CanvasViewer.prototype.drawOverlays=function(overlayInfo,ww,wc,forced){
	var stageWidth = this.stage.getWidth();
	var stageHeight = this.stage.getHeight();
	if(forced===true){
		this.OverlayTextTL.remove();
		this.OverlayTextTL=undefined;

		this.OverlayTextTR.remove();
		this.OverlayTextTR=undefined;

		this.OverlayTextBR.remove();
		this.OverlayTextBR=undefined;
	}

	if(this.OverlayTextTL==undefined){
		this.OverlayTextTL = new Kinetic.Text({
	        x: 30,
	        y: 30,
	        text: "Patient: "+overlayInfo.PN+"\nPatient ID: "+overlayInfo.PID,
	        fontSize: 14,
	        fill: 'white',
	        fontFamily: 'Calibri light'
	    });
	}else{
		this.OverlayTextTL.setText("Patient: "+overlayInfo.PN+"\nPatient ID: "+overlayInfo.PID + "\nW/L: "+ww+"/"+wc);
	}

	if(this.OverlayTextTR==undefined){
		this.OverlayTextTR = new Kinetic.Text({
	        x: stageWidth-150,
	        y: 30,
	        text: overlayInfo.DAT+"\nModality: "+overlayInfo.MOD + "\nSerie: "+overlayInfo.SEN,
	        fontSize: 14,
	        fill: 'white',
	        fontFamily: 'Calibri light'
	    });
	}else{
		this.OverlayTextTR.setText(overlayInfo.DAT+"\nModality: "+overlayInfo.MOD + "\nSerie: "+overlayInfo.SEN);
	}

	if(this.OverlayTextBR==undefined){
		this.OverlayTextBR = new Kinetic.Text({
	        x: stageWidth-150,
	        y: stageHeight-30,
	        text: "Study: "+overlayInfo.STN + "\nMade with MedViewer",
	        fontSize: 14,
	        fill: 'white',
	        fontFamily: 'Calibri light'
	    });
	}else{
		this.OverlayTextBR.setText("Study: "+overlayInfo.STN + "\nMade with MedViewer");
	}

	this.layerOverlay.add(this.OverlayTextTL);
	this.layerOverlay.add(this.OverlayTextTR);
	this.layerOverlay.add(this.OverlayTextBR);

	this.layerOverlay.draw();
	this.addMetricRuler(forced);
	this.drawDinamicOverlays(ww,wc,forced)
}
CanvasViewer.prototype.drawDinamicOverlays=function(ww,wc,forced){
	var stageWidth = this.stage.getWidth();
	var stageHeight = this.stage.getHeight();
	if(forced===true){
		this.OverlayTextBL.remove();
		this.OverlayTextBL=undefined;
	}

	if(this.OverlayTextBL==undefined){
		this.OverlayTextBL = new Kinetic.Text({
	        x: 30,
	        y: stageHeight-30,
	        text: "W/L: "+ww+"/"+wc,
	        fontSize: 14,
	        fill: 'white',
	        fontFamily: 'Calibri light'
	    });
	}else{
		this.OverlayTextBL.setText("W/L: "+ww+"/"+wc);
	}
	this.layerOverlay.add(this.OverlayTextBL);
	this.layerOverlay.draw();
}
CanvasViewer.prototype._zoomRoller=function(zoom){
	this.addMetricRuler(true, zoom);
}
CanvasViewer.prototype.addMetricRuler=function(forced, zoom){
	if(zoom==undefined){
		zoom = 1;
	}
	var stageWidth = this.stage.getWidth();
	var stageHeight = this.stage.getHeight();

	if(forced===true){
		this.backRuler.remove();
		this.backRuler=undefined;

		this.sideRuler.remove();
		this.sideRuler=undefined;
	}

	var ux = this.cspacing*this.scale[0]/zoom;
	var uy = this.rspacing*this.scale[1]/zoom;
	var rulerux = 10/ux;
	var ruleruy = 10/uy;
	var rulerBLine = 9/ux/zoom;
	var rulerSLine = 5/ux/zoom;
	var ruleruy = 10/uy;
	var rulerx = 150/ux;
	var rulery = 150/uy;
	var startx = (stageWidth/2)-(rulerx/2);
	var starty = (stageHeight/2)-(rulery/2);
	

	if(this.backRuler==undefined){
		this.backRuler = new Kinetic.Line({

	      points: [startx, stageHeight-40, startx+rulerx, stageHeight-40],
	      stroke: "red",
	      draggable: false
	  	});
	}else{
		this.backRuler.setPoints([startx, stageHeight-50, startx+rulerx, stageHeight-50]);
	}

	if(this.sideRuler==undefined){
		this.sideRuler = new Kinetic.Line({
	      points: [stageWidth-50, starty, stageWidth-50, starty+rulery],
	      stroke: "red",
	      draggable: false
	  	});
	}else{
		this.sideRuler.setPoints([stageWidth-50, starty, stageWidth-50, starty+rulery]);
	}

	for(var i = 0; i < 16; i++){
		var start = startx+(rulerux*i);
		if(i%5==0){
			var offsetH = rulerBLine;
		}else{
			var offsetH = rulerSLine;
		}
		if(this.backRulerLines[i]==undefined){
			this.backRulerLines[i] = new Kinetic.Line({
		      points: [start, stageHeight-40, start, stageHeight-40 - offsetH],
		      stroke: "red",
		      draggable: false
		  	});
		}else{
			this.backRulerLines[i].setPoints([start, stageHeight-40, start, stageHeight-40 - offsetH]);
		}

		var start = starty+(ruleruy*i);
		if(this.sideRulerLines[i]==undefined){
			this.sideRulerLines[i] = new Kinetic.Line({
		      points: [stageWidth-50, start, stageWidth-50-offsetH, start],
		      stroke: "red",
		      draggable: false
		  	});
		}else{
			this.sideRulerLines[i].setPoints([stageWidth-50, start, stageWidth-50-offsetH, start]);
		}

		this.layerOverlay.add(this.sideRulerLines[i]);
		this.layerOverlay.add(this.backRulerLines[i]);
	}

    this.layerOverlay.add(this.backRuler);
    this.layerOverlay.add(this.sideRuler);
    this.layerOverlay.draw();
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