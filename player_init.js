/* Module to initialize the players

Generate psuedorandom x, y coordinates, width and heigh parameters
(hard coded coodordinates for now, based on a canvas size of 800x600)

*/


module.exports = function(name, player, counter){

    player.id = counter;
    player.pname = name;
    player.x = Math.random()*700+20;
    player.y = Math.random()*500+20;		            
    player.height = Math.random()*50+50;
    player.width = Math.random()*50+50;

    return player
}

