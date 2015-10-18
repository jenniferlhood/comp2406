/*
Here we a prepared to receive a POST message from the client,
and acknowledge that, but still no attempt to extract the data or parse it
*/

/*
Use browser to view pages at http://localhost:3000/canvasWithTimer.html

//collaboration through polling
//=============================

When the blue cube is moved with the arrow keys, a POST message will be
sent to the server when the arrow key is released, also while the key is
held down.

Clients also request the position of the movingBox by polling the server.
The smoothness is thus affected by the rate at which the polling timer
runs. The trade off is smooth behaviour vs network traffic.

This polling app is a great candidate to use web sockets instead of polling.

Only the client moving the box will drop waypoints, the other clients don't
see the local waypoints, just their own.
*/

//Cntl+C to stop server (in Windows CMD console)

var http = require('http'); //need to http
var fs = require('fs'); //need to read static files
var url = require('url');  //to parse url strings
var init = require('./player_init');
var clean = require('./clean_players');

var counter = 1000; //to count invocations of function(req,res)

//server maintained location of moving box
var movingBoxLocation = {x:100,y:100}; //will be over written by clients



var MAX_PLAYERS = 5;
var currPlayers=0;
var playerNum=0;
var playerList = [];


var sampleArr = []; //sample this many poll request to remove dead users
var sampleNum = 25;
var sampleCount = 0;


var ROOT_DIR = 'html'; //dir to serve static files from

var MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'text/javascript', //should really be application/javascript
    'json': 'application/json',
    'png': 'image/png',
    'txt': 'text/text'
};

var get_mime = function(filename) {
    var ext, type;
    for (ext in MIME_TYPES) {
        type = MIME_TYPES[ext];
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return type;
        }
    }
    return MIME_TYPES['txt'];
};

http.createServer(function (request,response){
     var urlObj = url.parse(request.url, true, false);
     //console.log('\n============================');
	 //console.log("PATHNAME: " + urlObj.pathname);
     //console.log("REQUEST: " + ROOT_DIR + urlObj.pathname);
     //console.log("METHOD: " + request.method);
     
	
	 
     var receivedData = '';

     //attached event handlers to collect the message data
     request.on('data', function(chunk) {
        receivedData += chunk;
     });
	 
	 //event handler for the end of the message
     request.on('end', function(){
       
        //console.log('REQUEST END: ');
        //console.log('received data: ', receivedData);
        //console.log('type: ', typeof receivedData);
				
		if(request.method == "POST"){
		   var dataObj = JSON.parse(receivedData);
		   var returnObj = {}
		   var mvlocation;
		   
		   returnObj.text = "something";
		   		   
		  if (dataObj.request === "add"){
		        console.log("** add player request **");
		        var player = {}

		        
		        if (currPlayers <= MAX_PLAYERS){
                                        
                    player = init(dataObj.pname, player, playerNum);
                    		            
		            playerList.push(player);
		            console.log(playerList[0].x);
                    
                    returnObj.player = player;
		            returnObj.text = "add Player";
                    returnObj.playerList = playerList;
                    currPlayers = playerList.length;
                    playerNum++;
		           
                    		            
		            console.log("player: ", dataObj.pname, " added.");
		            console.log("player x: ", player.x, " player y:", player.y);
		            console.log("current number of players: ", currPlayers);
		            
		            		            
		            //console.log(JSON.stringify(returnObj));
		        } else {
		            console.log("maximum number of players");
		            returnObj.text = "could not add Player";
		            returnObj.playerList = playerList;
		        }
		        
		   //update the player's x and y location
		   } else if (dataObj.request === "update"){
    	        
                for (var i=0; i < playerList.length; i++){
                    if (dataObj.id === playerList[i].id){
                       
                        playerList[i].x = dataObj.x;
                        playerList[i].y = dataObj.y;
                    
                    }
                 }
                        
		   } else if (dataObj.request === "remove"){
		        console.log("** remove request **");
		        console.log(dataObj.id);
		       //for index to remove (start with nonsense in case there is no matchin player to remove)
		        var rem = -1; 
		        
		        for (var i=0; i < playerList.length; i++){		        
                    if (dataObj.id === playerList[i].id){
                        rem = i;
                    }
		        }
		        
		        if (rem >= 0){
		            playerList.splice(rem,1);
		            currPlayers--;
		            returnObj.text = "removed";
		            returnObj.playerList = playerList;
		       }
		       
		        
		   } else if (dataObj.request === "poll") {
	       			       		
	       		//if (dataObj.id > 0){
	           	   
	           	//generate poll sample data
	           	sampleArr.push(dataObj.id);
	           	sampleCount++;
	           	if (sampleCount >= sampleNum){
	           	    sampleArr.shift();
	           	} 
	           		           	
	       		returnObj.text = "--poll--";
		        returnObj.playerList = playerList;		        
		   }
		   

           response.writeHead(200, {'Content-Type': MIME_TYPES["json"]}); 
           response.end(JSON.stringify(returnObj)); //send just the JSON object
		}
     });
	 
     if(request.method == "GET"){
     
     
     //every pageload or refresh, clean the player list 
     // i.e. remove dead players based on sample data   
     playerList = clean(playerList,sampleArr);
     currPlayers = playerList.length;
     
     
	 //handle GET requests as static file requests
     fs.readFile(ROOT_DIR + urlObj.pathname, function(err,data){
       if(err){
		  //report error to console
          console.log('ERROR: ' + JSON.stringify(err));
		  //respond with not found 404 to client
          response.writeHead(404);
          response.end(JSON.stringify(err));
          return;
         }
         response.writeHead(200, {'Content-Type': get_mime(urlObj.pathname)});
         response.end(data);
       });
	 }


 }).listen(3000);

console.log('Server Running at http://127.0.0.1:3000  CNTL-C to quit');
