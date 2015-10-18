/*


*/




var word = "Play?";


var playing = false;
var player = {};
var playerList = [];


					
var timer; //used to control the free moving word
var pollingTimer; //timer to poll server for location updates

var wordBeingMoved; //word being dragged by mouse
var wordTargetRect = {x:0,y:0,width:0,height:0}; //bounding box around word being targeted

var deltaX, deltaY; //location where mouse is pressed
var canvas = document.getElementById('canvas1'); //our drawing canvas
var fontPointSize = 28; //point size for word text
var wordHeight = 25; //estimated height of a string in the editor
var editorFont = 'impact'; //font for your editor

function getWordAtLocation(aCanvasX, aCanvasY){
	
	  //locate the word targeted by aCanvasX, aCanvasY
	  //find a word whose bounding box contains location (aCanvasX, aCanvasY)
	  
	  var context = canvas.getContext('2d');
	  
	  for(var i=0; i<words.length; i++){
	     var wordWidth = context.measureText(words[i].word).width;
		 if((aCanvasX > words[i].x && aCanvasX < (words[i].x + wordWidth))  && 
			    (aCanvasY > words[i].y - wordHeight && aCanvasY < words[i].y)) {
			//set word targeting rectangle for debugging display
		    wordTargetRect = {x: words[i].x, y: words[i].y-wordHeight, width: wordWidth, height : wordHeight};
			return words[i]; //return the word found
		 } 

    }
	}

var drawCanvas = function(){

    var context = canvas.getContext('2d');
	
    context.fillStyle = 'white';
    context.fillRect(0,0,canvas.width,canvas.height); //erase canvas
   
    context.font = '' + fontPointSize + 'pt ' + editorFont;
    context.fillStyle = 'darkblue';
    context.strokeStyle = 'blue';
    context.fillText(word, canvas.height/2,40);
    
   // for(var i=0; i<words.length; i++){ 
	//	    var data = words[i];
	//		context.fillText(data.word, data.x, data.y);
    //        context.strokeText(data.word, data.x, data.y);
		
	//}

    //movingString.stringWidth = context.measureText(	movingString.word).width;
   // context.fillText(movingString.word, movingString.x, movingString.y);
	
    //draw moving boxs
    
    
  
    
    for (var i=0; i < playerList.length; i++){
    
    
        if (playerList[i].id !== player.id){
            context.fillStyle = 'cornflowerblue';
            context.fillRect(playerList[i].x,playerList[i].y,playerList[i].width,playerList[i].height);
            context.fillStyle = 'black';
            context.font = '18pt courier';
            context.fillText(playerList[i].pname,playerList[i].x,playerList[i].y); 
        }
    }
    
    context.font = '18pt courier';
    context.fillStyle = 'green';
    context.fillRect(player.x,player.y,player.width,player.height);
    context.fillStyle = 'black';
    context.fillText(player.pname,player.x,player.y); 
        
        	
	//draw moving box way points
	//for(i in wayPoints){
	//	context.strokeRect(wayPoints[i].x,
	//	             wayPoints[i].y,
	//				 movingBox.width,
	//				 movingBox.height);
	//}
	
	
	//draw circle							   
    // context.beginPath();
    //context.arc(canvas.width/2, //x co-ord
    //        canvas.height/2, //y co-ord
	//		canvas.height/2 - 5, //radius
	//		0, //start angle
	//		2*Math.PI //end angle
	//		);
    //context.stroke();
	
	//draw box around word last targeted with mouse -for debugging
	//context.strokeStyle = 'red';
	//context.strokeRect(wordTargetRect.x, wordTargetRect.y, wordTargetRect.width, wordTargetRect.height);
}



function handleTimer(){
	drawCanvas()
}

    //KEY CODES
	//should clean up these hard coded key codes
	var RIGHT_ARROW = 39;
	var LEFT_ARROW = 37;
	var UP_ARROW = 38;
	var DOWN_ARROW = 40;

// generate post request to server to add a new player
function addPlayer(){
    if (playing === false){
        var dataObj = {request:"add"};
        dataObj.pname = $("#name").val();
        var jsonString = JSON.stringify(dataObj);
        
        $.post("AddPlayer", jsonString, function(data, status){
            
            
            //var responseObj = JSON.parse(data);
            //player = responseObj.player;
            
                                    
            player = data.player;
            playerList = data.playerList;
            console.log("name: ", player.pname, ", id:", player.id);
            console.log("x: ", player.x, ", y:", player.y);
            console.log("height: ", player.height, ", width:", player.width);
            //console.log("request:", dataObj.request);
            //console.log("---> response:", response.text); 
            //console.log("---> response:", response.numPlayers);
            playing = true;
            word = dataObj.pname;
        });
    }   else {
        $("#name").val('Aready playing!!');
    } 
    
}

//generate a request to remove a player
function removePlayer(){
    var dataObj = {request: "remove", id: player.id};
    
    var jsonString = JSON.stringify(dataObj);
        
    if (playing === true){
    
        $.post("RemovePlayer", jsonString, function(data,status){
        console.log(data.text);
        playerList = data.playerList;
        playing = false;
        player = [];
        word = "Play?";
        $("#name").val();
        drawCanvas();
        
        });
    }
    
    
    
    
}


//poll the server to get the updated locations of all the players
function pollingTimerHandler(){
	//console.log("poll server");
	var dataObj = {request: "poll", id: player.id}; //used by server to react as poll
	
	//create a JSON string representation of the data object
	
	var jsonString = JSON.stringify(dataObj);
	
  
   //poll the server for the player array
	$.post("Poll", jsonString, function(data, status){
	        //rObj = JSON.parse(data);
			playerList = data.playerList;			
			console.log(data.playerList.length);
			});
}



function handleKeyDown(e){
	
	console.log("keydown code = " + e.which );
		
	var dXY = 5; //amount to move in both X and Y direction
	if(e.which == UP_ARROW && player.y >= dXY) 
	   player.y -= dXY;  //up arrow
	if(e.which == RIGHT_ARROW && player.x + player.width + dXY <= canvas.width) 
	   player.x += dXY;  //right arrow
	if(e.which == LEFT_ARROW && player.x >= dXY) 
	   player.x -= dXY;  //left arrow
	if(e.which == DOWN_ARROW && player.y + player.height + dXY <= canvas.height) 
	   player.y += dXY;  //down arrow
	
	//upate server with position data
	//may be too much traffic? 
	var dataObj = {id: player.id, x: player.x, y: player.y};
	dataObj.request = "update";
	 
	//create a JSON string representation of the data object
	var jsonString = JSON.stringify(dataObj);
      
    //update the server with a new location of the moving box
	$.post("positionData",
	    jsonString, 
		function(data, status){
		   //do nothing
		});  
    
}




function handleKeyUp(e){
	console.log("key UP: " + e.which);
	var dataObj = {id: player.id, x: player.x, y: player.y}; 
	dataObj.request = "update";
	
	//create a JSON string representation of the data object
	var jsonString = JSON.stringify(dataObj);
  
	//treat ENTER key like you would the join button
	if(e.which == 13){
	   // the enter key is number 13		  
	   addPlayer(); 
	   $('#name').val(''); //clear the user text field
	}
  
	$.post("positionData",
	    jsonString, 
		function(data, status){
	        //do nothing
			});

} 



$(document).ready(function(){

	//add mouse down listener to our canvas object
	//$("#canvas1").mousedown(handleMouseDown);
	//add keyboard handler to document
	$(document).keydown(handleKeyDown);
	$(document).keyup(handleKeyUp);

    //removePlayer();
	
	timer = setInterval(handleTimer, 100); 
	pollingTimer = setInterval(pollingTimerHandler, 300);  
    //timer.clearInterval(); //to stop
	
	drawCanvas();
});

