var LINEWIDTH_COLUMN_LINE = 10;

function initialize(){
    //document.addEventListener('deviceready', onDeviceReady);
    var btn = document.getElementById("go_btn");
    btn.addEventListener('touchstart', go_btn_touched);
    btn.addEventListener('mousedown', go_btn_touched);
    
    document.documentElement.style.webkitTouchCallout = "none";
    document.documentElement.style.webkitUserSelect = "none";

    
    screen.orientation = "landscape";
    screen.orientation.lock('landscape');
}


function go_btn_touched(event){
    event.target.setAttribute("src", "./img/go_btn_pressed.png");
    window.open("./game_surface.html", "_self", false);
}


function startGame(){
     // create game surface
    var c = document.createElement("canvas");
    c.width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    c.height = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    c.setAttribute("id", "game_canvas");
    document.body.appendChild(c)

    drawGameSurfaceDigit(3);
    setTimeout(function(){
	clearGameSurface();
	drawGameSurfaceDigit(2);
    }, 1000);
    setTimeout(function(){
	clearGameSurface();
	drawGameSurfaceDigit(1);
	}, 2000);
    setTimeout(function(){
	clearGameSurface();
	drawGameSurface();
    }, 3000);
    setTimeout(function(){
	c.addEventListener("touchstart", surface_pressed);
	c.addEventListener("mousedown", surface_pressed);
	c.addEventListener("mouseup", surface_released);
	c.addEventListener("touchend", surface_released);
    }, 3000);
}

function drawGameSurfaceDigit(digit){
    var ctx = document.getElementById("game_canvas").getContext('2d');
    var width = ctx.canvas.width/4;
    
    ctx.lineWidth = LINEWIDTH_COLUMN_LINE;
    // draw 4 vertical lines
    for(var i = 1; i<4; ++i){
    	ctx.beginPath();
    	ctx.moveTo(i*width,0);
    	ctx.lineTo(i*width,ctx.canvas.height);
    	ctx.stroke();
    }

    ctx.fillStyle = "#FF0000";
    ctx.font = "150px Arial";
    ctx.textAlign = "center";
    ctx.fillText(digit,ctx.canvas.width/2,ctx.canvas.height/2+50);
}

function drawGameSurface(){
    var ctx = document.getElementById("game_canvas").getContext('2d');
    var width = ctx.canvas.width/4;
    console.log(width);
    
    ctx.lineWidth = 10;
    // draw 4 vertical lines
    for(var i = 1; i<4; ++i){
	ctx.beginPath();
	ctx.moveTo(i*width,0);
	ctx.lineTo(i*width,ctx.canvas.height);
	ctx.stroke();
    }
}

function clearGameSurface(){
    var ctx = document.getElementById("game_canvas").getContext('2d');
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
}

function surface_pressed(event){
    var x = event.layerX;
    var column_width = event.target.width/4;
    
    var column = Math.floor(x/column_width);
    color_column(column, "#228B22");
}

function surface_released(event){
    var x = event.layerX;
    var column_width = event.target.width/4;
    
    var column = Math.floor(x/column_width);
    color_column(column, "#FFFFFF");
}

function color_column(no,color){
    var column_width = document.getElementById("game_canvas").width/4;

    var ctx = document.getElementById("game_canvas").getContext("2d");
    ctx.fillStyle = color;
    if(no==0){
	ctx.fillRect(0,0,column_width-LINEWIDTH_COLUMN_LINE/2,ctx.canvas.height);
    }
    else if(no==1 || no==2){
	ctx.fillRect(no*column_width+LINEWIDTH_COLUMN_LINE/2,0,column_width-LINEWIDTH_COLUMN_LINE,ctx.canvas.height);
    }
    else{
	ctx.fillRect(3*column_width+LINEWIDTH_COLUMN_LINE/2,0,column_width-LINEWIDTH_COLUMN_LINE/2,ctx.canvas.height);
    }
}
