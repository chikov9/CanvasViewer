// This object holds the implementation of each drawing tool.
  var tools = {};
  
  tools.none = function () {
	var tool = this;
	this.name = 'none';
  }
  
  // The drawing pencil.
  tools.pencil = function () {
    var tool = this;
    this.started = false;
	this.name = 'pencil';
    // This is called when you start holding down the mouse button.
    // This starts the pencil drawing.
    this.mousedown = function (ev,context) {
		context.beginPath();
		console.log(ev._x+" "+ev._y);
        context.moveTo(ev._x, ev._y);
        tool.started = true;
    };

    // This function is called every time you move the mouse. Obviously, it only 
    // draws if the tool.started state is set to true (when you are holding down 
    // the mouse button).
    this.mousemove = function (ev,context) {
      if (tool.started) {
		console.log(ev._x+" "+ev._y);
        context.lineTo(ev._x, ev._y);
		context.lineWidth = 3;
		context.strokeStyle = "red";
        context.stroke();
      }
    };

    // This is called when you release the mouse button.
    this.mouseup = function (ev,context) {
      if (tool.started) {
        tool.mousemove(ev,context);
        tool.started = false;
      }
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

    this.mousemove = function (ev,context,canvas) {
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

      context.strokeRect(x, y, w, h);
    };

    this.mouseup = function (ev,context,canvas) {
      if (tool.started) {
        tool.mousemove(ev,context,canvas);
        tool.started = false;
      }
    };
  };
  tools.line = function () {
	  var tool = this;
	  this.started = false;
	  this.name = 'line';
	  this.mousedown = function (ev) {
		tool.started = true;
		tool.x0 = ev._x;
		tool.y0 = ev._y;
	  };

	  this.mousemove = function (ev,context,canvas) {
		if (!tool.started) {
		  return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		
		context.beginPath();
		context.lineWidth = 3;
		context.strokeStyle = "red";
		context.moveTo(tool.x0, tool.y0);
		context.lineTo(ev._x,   ev._y);
		context.stroke();
		context.closePath();
	  };

	  this.mouseup = function (ev,context,canvas) {
		if (tool.started) {
		  tool.mousemove(ev,context,canvas);
		  tool.started = false;
		}
	  };
	};