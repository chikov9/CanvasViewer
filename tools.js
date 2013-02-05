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
              lineCap: "round",
              lineJoin: "round",
              draggable: true
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
      tool.line.on('mousedown',function(e){
        tool.line.moveToTop()
      })
      if(cb)
        cb(tool.line.getPoints()[0].x,tool.line.getPoints()[0].y,tool.line.getPoints()[1].x,tool.line.getPoints()[1].y);
    };
  };

  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    this.moving = false;
    this.name = 'line';
    this.rect = null;
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
          tool.rect = new Kinetic.Rect({
              x: x1,
              y: y1,
              width: 1,
              height: 1,
              stroke: "red",
              draggable: true
          });
          layer.add(tool.rect);
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

          x1=tool.points[0];
          y1=tool.points[1];
          x2 = mousePos.x;
          y2 = mousePos.y;
          tool.points[2]=x2;
          tool.points[3]=y2;
          tool.rect.setSize(x2-tool.points[0],y2-tool.points[1]);
          tool.moving = true;
          layer.drawScene();
      }
      if(cb){
        cb(x1,y1,x2,y2);
      }
    };

    this.mouseup = function (ev,stage,layer,cb) {
      tool.moving=false;
      tool.rect.on('mousedown',function(e){
        tool.rect.moveToTop()
      })
      if(cb)
        cb(tool.points[0],tool.points[1],tool.points[2],tool.points[3]);
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
              stroke: "red",
              draggable: true
          });
          layer.add(tool.line);
          tool.line.moveToTop()
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