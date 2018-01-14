var LINEWIDTH_COLUMN_LINE = 10;

document.addEventListener("deviceready", initialize, false);

function scan_and_connect_glove(){
    document.getElementById("msg").innerHTML = "Scanning";
    ble.scan([], 5, function(device){
	if(device.name == "TECO Wearable 4"){
	    ble.connect(device.id, connect_success, connect_fail);
	}
    }, function(){
	document.getElementById("msg").innerHTML = "Scan fail";
    });
}

function ble_disable(){
    document.getElementById("msg").innerHTML = "You have to enable bluetooth."
}

function connect_success(peripheral){
    document.getElementById("msg").innerHTML = "Erfolgreich connected";
}

function connect_fail(peripheral){
    document.getElementById("msg").innerHTML = "Fehler beim connecten";
}

function initialize(){
    document.getElementById("msg").innerHTML = ble;
    ble.isEnabled(scan_and_connect_glove, ble_disabled);
    
    var btn = document.getElementById("go_btn");
    btn.addEventListener('touchstart', go_btn_touched);
    btn.addEventListener('mousedown', go_btn_touched);
    
    btn.addEventListener('touchend', go_btn_released);
    btn.addEventListener('mouseup', go_btn_released);
    
    document.documentElement.style.webkitTouchCallout = "none";
    document.documentElement.style.webkitUserSelect = "none";

    
    screen.orientation = "landscape";
    screen.orientation.lock('landscape');
}


function go_btn_touched(event){
    event.target.setAttribute("src", "./img/go_btn_pressed.png");
}

function go_btn_released(event){
    window.open("./game_surface.html", "_self", false);
}


function startGame(){
    // initialise bluetooth stuff
    
    // start countdown

    // start 
    
}


function div_pressed(event){
    event.target.style.backgroundColor = "#000000";
}

function div_released(event){
    event.target.style.backgroundColor = "#FFFFFF";

}
			   
