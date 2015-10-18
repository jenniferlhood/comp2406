/*
Clean Player Module

Check that players are still active by checkinging poll 
sample data. Remove any player id that is not actively polling the client.

Playerlist: Array of player data generated and maintained by server.
SampleArr: Sample poll data is gathered by sever from request objects.
*/

module.exports = function(playerList, sampleArr){
    //console.log(sampleArr);
    
        
    var newList = [];
    if (playerList.length > 0){
        
        for(var i=0; i < playerList.length; i++){  
            var include = false; 
            for(var j=0; j < sampleArr.length; j++){
                if (playerList[i].id === sampleArr[j]){
                    include = true;
                                        
                }
            }
            if (include === true){
                newList.push(playerList[i]);
                
            } 
        }
    }
    
    return newList;
}
