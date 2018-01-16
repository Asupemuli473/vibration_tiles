var LINEWIDTH_COLUMN_LINE = 10;
var connected = false;
var connecting = false;
var connected_device;
var FPS = 30;
var ctx;

document.addEventListener("deviceready", initialize, false);

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

    document.getElementById("game_div").style.display="none";
    document.getElementById("drawing_canvas").width = document.body.clientWidth;
    document.getElementById("drawing_canvas").height = document.body.clientHeight;
    ctx = document.getElementById("drawing_canvas").getContext('2d');
    ctx.font = "15px Roboto Slab";
    
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
		connected_device = device;
	    }, function(){
		console.log("error while connecting");
		document.getElementById("msg").innerHTML = "Error while connecting. Make sure the device is turned on";
		document.getElementById("msg").style.color = "#FF0000";
	    });
	}
    }, function() {
	    document.getElementById("msg").innerHTML = "Teco Wearable 4 not found. Make sure its turned on!";
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
    // if(connected){
    	start_game();
    // }
    // else{
    // 	event.target.setAttribute("src", "./img/go_btn.png");
    // }
}



// game logic
var duration_round = 4096;
var round = 0;
var sequence = 0;
var finger_pressed = 0;
var g_o = false;
var score = 0;
var steps;
var step;


// calcs new seq and writes it to wearable
function set_next_sequence(){
    var min = 0;
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
	return true;
    }
    else {
	g_o = true;
	game_over();
	return false;
    }
}



function generate_next_round(){
    if(!g_o){
	if(sequence > 0){
	    game_over();
	}
	else if(sequence == 0){
    	    reset_divs();
	    round = round + 1;
	    set_next_sequence();
	    
	    if(duration_round > 1024 && this.round % 10 == 0){
		duration_round = duration_round / 2;
	    }
	    steps = duration_round/1000*FPS;
	    step = 0;
	    var step_size_line = document.getElementById("drawing_canvas").height/steps;
	    
	    setTimeout(function(){
		draw_line(step_size_line);
	    }, 1000/FPS);
	    setTimeout(generate_next_round, duration_round);
	}
    }
}

function draw_line(step_size){
    if(step<steps){
	ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
	ctx.textAlign = "start";
	ctx.fillText("Round "+(round+1),0,-5+step*step_size);
	ctx.fillText("Round "+(round),0,step*step_size+15);
	ctx.textAlign = "end";
	ctx.fillText("Score "+score,ctx.canvas.width,-5+step*step_size);
	ctx.beginPath();
	ctx.moveTo(0,step*step_size);
	ctx.lineTo(ctx.canvas.width,step*step_size);
	ctx.stroke();
	step = step + 1;
	setTimeout(function(){
	    draw_line(step_size);
	}, 1000/FPS);
    }
}

function game_over(){
    // todo let vibrate three times
    write_to_wearable(0);
    console.log("game over");
}

function start_game(){
    document.getElementById('welcome_screen').style.display = "none";
    document.getElementById('game_div').style.display = "block";
    generate_next_round();
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
    // data[0] = 0x00;
    // data[1] = 0x00;
    // data[2] = 0x00;
    // data[3] = 0x00;

    // if(8 & code){
    // 	data[0] = 0xFF;
    // }
    // if(4 & code){
    // 	data[1] = 0xFF;
    // }
    // if(2 & code){
    // 	data[2] = 0xFF;
    // }
    // if(1 & code){
    // 	data[3] = 0xFF;
    // }
    // ble.writeWithoutResponse(connected_device.id, VIB_SERVICE, VIB_CHARACTERISTIC, data.buffer, function(){
    // }, function(){
    // 	console.log("error while writing to wearable");
    // 	    // todo error handling here
    // 	});
    
}
