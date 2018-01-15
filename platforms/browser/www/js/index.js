var LINEWIDTH_COLUMN_LINE = 10;

document.addEventListener("deviceready", initialize, false);

function connect_glove(){
    document.getElementById("msg").innerHTML = "Connecting...";
    ble.connect("713D0000-503E-4C75-BA94-3148F18D941E", connect_success, connect_fail);
    
}

function ble_disable(){
    document.getElementById("msg").innerHTML = "You have to enable bluetooth."
}

function connect_success(peripheral){
    document.getElementById("msg").innerHTML = "Successfully connected";
}

function connect_fail(peripheral){
    document.getElementById("msg").innerHTML = "Error while connecting.";
}

function initialize(){
    document.getElementById("msg").innerHTML = "Trying to connect...";
    // ble.isEnabled(connect_glove, ble_disabled);
    
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
			   
