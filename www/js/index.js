var LINEWIDTH_COLUMN_LINE = 10;
var connected = false;
var connecting = false;
var connected_device;
var FPS = 30;
var ctx;

document.addEventListener("deviceready", initialize, false);

document.addEventListener("orientationchange", function() {
    document.getElementById("drawing_canvas").width = document.body.clientWidth;
    document.getElementById("drawing_canvas").height = document.body.clientHeight;

    if(draw_interval_id){
    	ctx.font = "15px Roboto Slab";
    	clearInterval(draw_interval_id);
    	draw_interval_id = setInterval(draw_line, 1000/FPS);
    }
    });

var data = new Uint8Array(4);

var VIB_SERVICE	       	= "713D0000-503E-4C75-BA94-3148F18D941E";
var VIB_CHARACTERISTIC	= "713D0003-503E-4C75-BA94-3148F18D941E";

function initialize(){
    var go_btn = document.getElementById("go_btn");
    var connect_btn = document.getElementById("connect_btn");
    
    go_btn.addEventListener('touchstart', go_btn_touched);
    go_btn.addEventListener('touchend', go_btn_released);
    
    connect_btn.addEventListener('touchstart', connect_btn_touched);
    connect_btn.addEventListener('touchend', connect_btn_released);

    
    document.getElementById("btn1").addEventListener("touchstart", div_pressed);
    document.getElementById("btn2").addEventListener("touchstart", div_pressed);
    document.getElementById("btn3").addEventListener("touchstart", div_pressed);
    document.getElementById("btn4").addEventListener("touchstart", div_pressed);
    
    document.getElementById("btn1").addEventListener("touchend", div_released);
    document.getElementById("btn2").addEventListener("touchend", div_released);
    document.getElementById("btn3").addEventListener("touchend", div_released);
    document.getElementById("btn4").addEventListener("touchend", div_released);
    
    document.getElementById("game_over_div").addEventListener("touchstart", restart);

    document.getElementById("connect_btn2").addEventListener("touchstart", connect_btn_touched);
    document.getElementById("connect_btn2").addEventListener("touchend", reconnect);
    
    document.getElementById("drawing_canvas").width = document.body.clientWidth;
    document.getElementById("drawing_canvas").height = document.body.clientHeight;
    ctx = document.getElementById("drawing_canvas").getContext('2d');
    
    document.documentElement.style.webkitTouchCallout = "none";
    document.documentElement.style.webkitUserSelect = "none";

}


function set_up_bt(){
    ble.isEnabled(function(){
	document.getElementById("msg").innerHTML = "Scanning...";
	document.getElementById("msg").style.color = "#FFD700";
	scan_and_connect_glove();
    }, function(){
	document.getElementById("msg").innerHTML = "You have to enable bluetooth."
	document.getElementById("msg").style.color = "#FF0000";
    });
}


function scan_and_connect_glove(){
    ble.scan([], 5, function(device) {
	if (device.name === "TECO Wearable 4") {
	    ble.connect(device.id, function(){
		document.getElementById("msg").innerHTML = "Successfully connected. Ready to play!";
		document.getElementById("msg").style.color = "#00FF00";
		connected = true;
		connecting = false;
		connected_device = device;
	    }, function(){
		connected = false;
		document.getElementById("game_div").style.display = "none";
		document.getElementById("disconnected_div").style.display = "block";
		
	    });
	}
    }, function() {
	    
    });
    setTimeout(function(){
	if(!connected){
	    document.getElementById("msg").innerHTML = "Teco Wearable 4 not found. Make sure its turned on!";
	    document.getElementById('msg').style.color = "#FF0000";
	    connecting = false;
	}
    }, 5000);
}


function reconnect_glove(){
    ble.scan([], 5, function(device) {
	if (device.name === "TECO Wearable 4") {
	    ble.connect(device.id, function(){
		connecting = false;
		document.getElementById("game_div").style.display = "block";
		document.getElementById("disconnected_div").style.display = "none";
		//count_down(3);
		//setTimeout(function(){
		    connected = true;
		    write_to_wearable(sequence);
		//}, 4000);
	    }, function(){
		connected = false;
		document.getElementById("game_div").style.display = "none";
		document.getElementById("disconnected_div").style.display = "block";
		document.getElementById("rec_msg").innerHTML = "The device has disconnected. Hit connect to reconnect";
		document.getElementById("rec_msg").style.color = "#000000";
	    });
	}
    }, function() {

    });
    setTimeout(function(){
	if(!connected){
	    document.getElementById("rec_msg").innerHTML = "Teco Wearable 4 not found. Make sure its turned on!";
	    document.getElementById('rec_msg').style.color = "#FF0000";
	    connecting = false;
	}
    }, 5000);
}

function reconnect(){
    event.target.setAttribute("src", "./img/connect_btn.png");
    ble.isEnabled(function(){
	document.getElementById("rec_msg").innerHTML = "Scanning...";
	document.getElementById("rec_msg").style.color = "#FFD700";
	reconnect_glove();
    }, function(){
	document.getElementById("rec_msg").innerHTML = "You have to enable bluetooth."
	document.getElementById("rec_msg").style.color = "#FF0000";
    });
}
    



function connect_btn_touched(event){
    event.target.setAttribute("src", "./img/connect_btn_pressed.png");
}

function writeDone(){
    console.log("write succ");
}

function writeFail(){
    console.log("write fail");
}



function connect_btn_released(event){
    event.target.setAttribute("src", "./img/connect_btn.png");
    if(!connecting && !connected){
	connecting = true;
	set_up_bt();
    }
}

function go_btn_touched(event){
    event.target.setAttribute("src", "./img/go_btn_pressed.png");
}

function go_btn_released(event){
    if(connected){
    	start_game();
    }
    else{
    	event.target.setAttribute("src", "./img/go_btn.png");
    }
}



// game logic
var DURATION_ROUND_INIT = 8192;
var duration_round = DURATION_ROUND_INIT;
var round = 0;
var sequence = 0;
var finger_pressed = 0;
var g_o = false;
var score = 0;
var steps;
var step;



// calcs new seq and writes it to wearable
function set_next_sequence(){
    var min = 1;
    var max = 15;
    sequence = Math.floor((Math.random() * (max - min)) + min);
    console.log(sequence);
    write_to_wearable(sequence);
}

// checks whether or not a finger is legal (binary coded) 8 index, 4 middle, 2 ring, 1 pinky (right hand pressing on div)
function legal_finger(code){
    if(sequence & code){
	return true;
    }
    return false;
}

// function to update modell when finger is pressed, returns whether or not set finger was legal
// num: div order: 4 - 3 - 2 - 1
function set_finger_pressed(num){
    var code = Math.pow(2,num-1); // format into binary
    if(legal_finger(code)){
	sequence = sequence - code;
	score = score + steps - step;
	write_to_wearable(sequence);
	if(sequence==0){
	    generate_next_round();
	}
	return true;
    }
    else {
	g_o = true;
	game_over();
	return false;
    }
}



function generate_next_round(){
    clearInterval(draw_interval_id);
    if(!g_o){
	if(sequence > 0){
	    game_over();
	    g_o = true;
	}
	else if(sequence == 0){
    	    reset_divs();
	    round = round + 1;
	    set_next_sequence();
	    
	    if(duration_round > 1024 && this.round % 10 == 0){
		duration_round = duration_round / 2;
	    }
	    steps = Math.ceil(duration_round/1000*FPS);
	    step = 0;
	    draw_interval_id = setInterval(draw_line, 1000/FPS);
	}
    }
}

function draw_line(){
    if(!connected){
	return;
    }
    if(step<steps){
	var y = ctx.canvas.height*(step/steps)-ctx.lineWidth;
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
	ctx.textAlign = "start";
	ctx.fillText("Round "+(round+1),0,y-5);
	ctx.fillText("Round "+(round),0,y+15);
	ctx.textAlign = "end";
	ctx.fillText("Score "+score,ctx.canvas.width,-5+y);
	ctx.beginPath();
	ctx.moveTo(0,y);
	ctx.lineTo(ctx.canvas.width,y);
	ctx.stroke();
	step = step + 1;
    }
    else{
	generate_next_round();
    }
}

function vibrate_times(times){
    if(times < 0){
	write_to_wearable(0);
    }
    else{
	write_to_wearable(15);
	setTimeout(function(){
	    write_to_wearable(0);
	    setTimeout(function(){
		vibrate_times(times-1);
	    },250);
	},250);
    }
}


function game_over(){
    vibrate_times(3);
    write_to_wearable(0);
    clearInterval(draw_interval_id);
    draw_interval_id = 0;
    document.getElementById("game_div").style.display="none";
    document.getElementById("game_over_div").style.display = "block";
    document.getElementById("score").innerHTML = score;
}

var draw_interval_id;
function start_game(){
    document.getElementById('welcome_screen').style.display = "none";
    document.getElementById('game_div').style.display = "block";
    document.getElementById("drawing_canvas").getContext('2d').canvas.style.zIndex = "4";
    count_down(3);
}

function count_down(digit){
    if(digit>0){
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
	ctx.font = "100px Roboto Slab";
	ctx.fillStyle = "#ff0000";
	ctx.fillText(digit,(ctx.canvas.width-ctx.measureText(digit).width)/2,ctx.canvas.height/2-20);
	setTimeout(function(){
	    count_down(digit-1);
	},1000);
    }
    else{
	ctx.canvas.style.zIndex = "2";
	ctx.fillStyle = "#000000";
	ctx.font = "15px Roboto Slab";
	generate_next_round();
    }
}


function restart(event){
    document.getElementById("game_over_div").style.display = "none";
    document.getElementById("game_div").style.display="block";
    g_o = false;
    sequence = 0;
    round = 0;
    score = 0;
    duration_round = DURATION_ROUND_INIT;
    ctx.canvas.style.zIndex = "4";
    ctx.textAlign = "start";
    count_down(3);
}




function reset_divs(){
    var num_divs = 4;
    for(var i = 1;i<num_divs+1;i++){
	document.getElementById('btn'+i).style.backgroundColor = "#FFFFFF";
    }
}

function div_pressed(event){
    var i = btn_to_int(event.target.id);
    if(set_finger_pressed(i)){
    	event.target.style.backgroundColor = "#00FF00";
    }
    else{
    	event.target.style.backgroundColor = "#FF0000";
    }

}

function div_released(event){
    event.target.style.backgroundColor = "#FFFFFF";
}

function btn_to_int(btn_id){
    return parseInt(btn_id.substring(3));
}


// code is 4bit long number to determine which off the motors should be turned on
function write_to_wearable(code){
    // default all off
    data[0] = 0x00;
    data[1] = 0x00;
    data[2] = 0x00;
    data[3] = 0x00;

    if(8 & code){
    	data[0] = 0xFF;
    }
    if(4 & code){
    	data[1] = 0xFF;
    }
    if(2 & code){
    	data[2] = 0xFF;
    }
    if(1 & code){
    	data[3] = 0xFF;
    }
    ble.writeWithoutResponse(connected_device.id, VIB_SERVICE, VIB_CHARACTERISTIC, data.buffer, function(){
    }, function(){
	connected = false;
	document.getElementById("game_div").style.display = "none";
	document.getElementById("disconnected_div").style.display = "block";
    	});
    
}


  
