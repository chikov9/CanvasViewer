// This object holds the implementation of each drawing tool.
  var tools = {};
  
  tools.none = function () {
	var tool = this;
	this.name = 'none';
  }
  
  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.moving = false;
    this.name = 'line';
    this.line = null;
    this.points = null;
    this.mousedown = function (ev,stage, layer,cb) {
      var x1,y1;
      if (tool.moving){
          tool.moving = false; layer.draw();
      } else {
          var mousePos = stage.getMousePosition();
          x1=mousePos.x;
          y1=mousePos.y;
          tool.points = [x1,y1,x1,y1];
          tool.line = new Kinetic.Line({
              points: tool.points,
              stroke: "red",
              strokeWidth: 15,
              lineCap: "round",
              lineJoin: "round"
          });
          layer.add(tool.line);
          //start point and end point are the same
          tool.moving = true;    
          layer.drawScene();            
      }
      if(cb){
        cb(x1,y1)
      }
    };

    this.mousemove = function (ev,stage,layer,cb) {
      var x1,y1,x2,y2;
      if (tool.moving) {
          var mousePos = stage.getMousePosition();

          x1=tool.line.getPoints()[0].x;
          y1=tool.line.getPoints()[0].y;
          x2 = mousePos.x;
          y2 = mousePos.y;
          tool.points.push(x2);
          tool.points.push(y2);
          tool.line.setPoints(tool.points)
          tool.moving = true;
          layer.drawScene();
      }
      if(cb){
        cb(x1,y1,x2,y2);
      }
    };

    this.mouseup = function (ev,stage,layer,cb) {
      tool.moving=false;
      if(cb)
        cb(tool.line.getPoints()[0].x,tool.line.getPoints()[0].y,tool.line.getPoints()[1].x,tool.line.getPoints()[1].y);
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.started = false;
	this.name = 'rect';
    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (ev,context,canvas,cb) {
      if (!tool.started) {
        return;
      }

      var x = Math.min(ev._x,  tool.x0),
          y = Math.min(ev._y,  tool.y0),
          w = Math.abs(ev._x - tool.x0),
          h = Math.abs(ev._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!w || !h) {
        return;
      }
	  context.lineWidth = 3;
	  context.strokeStyle = "red";
	  context.fillStyle = "red";
      context.strokeRect(x, y, w, h);
	  if(cb)
			cb(x,y,w,h);
    };

    this.mouseup = function (ev,context,canvas,cb) {
      if (tool.started) {
        tool.mousemove(ev,context,canvas,cb);
        tool.started = false;
      }
    };
  };
  tools.line = function () {
	  var tool = this;
	  this.moving = false;
	  this.name = 'line';
    this.line = null;
	  this.mousedown = function (ev,stage, layer,cb) {
      var x1,y1;
		  if (tool.moving){
          tool.moving = false; layer.draw();
      } else {
          var mousePos = stage.getMousePosition();
          tool.line = new Kinetic.Line({
              points: [0, 0, 50, 50],
              stroke: "red"
          });
          layer.add(tool.line);
          //start point and end point are the same
          x1=mousePos.x;
          y1=mousePos.y;
          tool.line.getPoints()[0].x = x1;
          tool.line.getPoints()[0].y = y1;
          tool.line.getPoints()[1].x = x1;
          tool.line.getPoints()[1].y = y1;

          tool.moving = true;    
          layer.drawScene();            
      }
      if(cb){
        cb(x1,y1)
      }
	  };

	  this.mousemove = function (ev,stage,layer,cb) {
      var x1,y1,x2,y2;
		  if (tool.moving) {
          var mousePos = stage.getMousePosition();

          x1=tool.line.getPoints()[0].x;
          y1=tool.line.getPoints()[0].y;
          x2 = mousePos.x;
          y2 = mousePos.y;

          tool.line.getPoints()[1].x = x2;
          tool.line.getPoints()[1].y = y2;
          tool.moving = true;
          layer.drawScene();
      }
      if(cb){
        cb(x1,y1,x2,y2);
      }
	  };

	  this.mouseup = function (ev,stage,layer,cb) {
		  tool.moving=false;
      if(cb)
        cb(tool.line.getPoints()[0].x,tool.line.getPoints()[0].y,tool.line.getPoints()[1].x,tool.line.getPoints()[1].y);
	  };
	};