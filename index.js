var LINEWIDTH_COLUMN_LINE = 10;
var connected = false;
var connecting = false;
var connected_device;

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

    

function go_btn_touched(event){
    event.target.setAttribute("src", "./img/go_btn_pressed.png");
}

function connect_btn_touched(event){
    // load new file
}

function writeDone(){
    console.log("write succ");
}

function writeFail(){
    console.log("write fail");
}



function connect_btn_released(event){
    // change back button
    if(!connecting && !connected){
	connecting = true;
	set_up_bt();
    }
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
var period_length = 4096;
var round = 0;
var sequence = 0;
var finger_pressed = 0;
console.log(sessionStorage.getItem('device'));
connected_device = JSON.parse(sessionStorage.getItem('device')); // extract from sessionstorage

// calcs new seq and writes it to wearable
function set_next_sequence(){
    var min = 0;
    var max = 15;
    sequence = (Math.random() * (max - min)) + min;
    write_to_wearable(sequence);
}

// checks whether or not a finger is leagl (binary coded) 8 - index, 4 - middle, ...
function legal_finger(code){
    if(sequence & code){
	return true;
    }
    game_over();
    return false;
}

// function to update modell when finger is pressed, returns whether or not set finger was legal
// num: 1-4, 4 being index,...
function set_finger_pressed(num){
    console.log("finger pressed " + num);
    var code = Math.pow(2,num-1); // format into binary
    finger_pressed = finger_pressed + code;
    return legal_finger(code);
}


// function to update date after finger is released
function set_finger_released(num){
    finger_pressed = finger_pressed - Math.pow(2,num-1);
}

function generate_next_round(){
    //if(finger_pressed == sequence){
    round = round + 1;

    set_next_sequence();
    
    if(period_length > 1024 && this.round % 100 == 0){
	period_length = period_length / 2;
    }
    setTimeout(generate_next_round, period_length);
	// }
	// else{
	//     game_over();
	// }
}

function game_over(){

}

function start_game(){
    document.getElementById('welcome_screen').style.display = "none";
    document.getElementById('game_div').style.display = "block";
    generate_next_round();
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
    set_finger_released(btn_to_int(event.target.id));
    event.target.style.backgroundColor = "#FFFFFF";
}

function btn_to_int(btn_id){
    return parseInt(btn_id.substring(3));
}


// code is 4bit long number to determine which off the motors should be turned on
function write_to_wearable(code){
    // default all off
    data[0] = 0x00;
.css    data[1] = 0x00;
    data[2] = 0x00;
    data[3] = 0x00;

    if(8 & code){
	data[0] = 0xAA;
    }
    if(4 & code){
	data[1] = 0xAA;
    }
    if(2 & code){
	data[2] = 0xAA;
    }
    if(1 & code){
	data[3] = 0xAA;
    }
    ble.writeWithoutResponse(connected_device.id, VIB_SERVICE, VIB_CHARACTERISTIC, data.buffer, function(){
    }, function(){
	console.log("error while writing to wearable");
	    // todo error handling here
	});
    
}
