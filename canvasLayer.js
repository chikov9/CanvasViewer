function CanvasLayer(name, x, y, width, height, canvas){
	this.name = name;
	this.x = x;
	this.y = y;
	this.height=height;
	this.width=width;
	this.canvas = canvas;
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