function CanvasLayer(name, x, y, width, height, canvas){
	this.name = name;
	this.x = x;
	this.y = y;
	this.originalHeight = this.height=height;
	this.originalWidth = this.width=width;
	this.canvas = canvas;
	this.ctx = canvas.getContext('2d');
	
}
CanvasLayer.prototype.getX = function(){return this.x;}
CanvasLayer.prototype.getY = function(){return this.y;}
CanvasLayer.prototype.setX = function(val){return this.x = val;}
CanvasLayer.prototype.setY = function(val){return this.y = val;}
CanvasLayer.prototype.getName = function(){return this.name;}
CanvasLayer.prototype.getWidth = function(){return this.width;}
CanvasLayer.prototype.getHeight = function(){return this.height;}
CanvasLayer.prototype.getCanvas = function(){return this.canvas;}
CanvasLayer.prototype.getContext = function(){return this.canvas.getContext('2d');}
CanvasLayer.prototype.rotate = function(_angle){
	var angle = _angle*Math.PI/180;
	var tmpcanvas = document.createElement('canvas');
	var dim = this.canvas.width < this.canvas.height ? this.canvas.height: this.canvas.width;
	tmpcanvas.width = dim;
	tmpcanvas.height = dim;
	var x = dim/2;
	var y = dim/2;
	var tmpctx = tmpcanvas.getContext('2d');
	tmpctx.translate(x,y);
	tmpctx.rotate(angle);
	tmpctx.translate(-x,-y);
	var dx = tmpcanvas.width/2-this.canvas.width/2, dy=tmpcanvas.height/2-this.canvas.height/2;
	tmpctx.drawImage(this.canvas,dx,dy,this.canvas.width,this.canvas.height);
	this.width = this.canvas.width = dim;
	this.height = this.canvas.height = dim;
	this.ctx.drawImage(tmpcanvas,0,0);
}
CanvasLayer.prototype.flipHorizontal = function(){
	var tmpcanvas = document.createElement('canvas');
	tmpcanvas.width = this.canvas.width;
	tmpcanvas.height = this.canvas.height;
	var tmpctx = tmpcanvas.getContext('2d');
	tmpctx.translate(0, this.canvas.height);
	tmpctx.scale(1, -1);
	tmpctx.drawImage(this.canvas,0,0);
	this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height);
	this.ctx.drawImage(tmpcanvas,0,0);
}
CanvasLayer.prototype.flipVertical = function(){
	var tmpcanvas = document.createElement('canvas');
	tmpcanvas.width = this.canvas.width;
	tmpcanvas.height = this.canvas.height;
	var tmpctx = tmpcanvas.getContext('2d');
	tmpctx.translate(this.canvas.width, 0);
	tmpctx.scale(-1, 1);
	tmpctx.drawImage(this.canvas,0,0);
	this.ctx.clearRect(0,0, this.canvas.width,this.canvas.height);
	this.ctx.drawImage(tmpcanvas,0,0);
}