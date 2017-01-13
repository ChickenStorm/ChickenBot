/*
Copyright 2014-2015 ChickenStorm

This file is part of Asylamba Combat Simulator.

 This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
                                               /-----------/
                                              /           / 
                                             /     /-----/  
                         /--------\         /     /         
                        /          \       /     /-----/    
              /---------\/\/\   /\  \--\  /           /     
             /               \  \/      \/     /-----/      
            /                /           \    /             
           /      /-----/\/\/             \  /              
          /      /      \                  \/               
         /      /        \-----------\      \               
        /      /                      \      \              
       /      /                        \      \             
      /      /                          \      \            
      |     /                            \     |            
      |     |                            |     |            
      |     |                            |     |            
      |     |                            |     |            
      |     |                            |     |            
      |     |                            |     |            
      |     |                            |     |            
      |     \                            /     |            
      \      \                          /      /            
       \      \                        /      /             
        \      \                      /      /              
         \      \                    /      /               
          \      \                  /      /                
           \      \----------------/      /                 
            \                            /                  
             \                          /                   
              \------------------------/                    
 
 
 */


var htmlPage = " <div style =' position:relative;text-align: center;display: inline-block; ' id='generalInfos' > Version "+ version +" </div> <div style =' position:absolute;text-align: center;display: inline-block;' id='author' > </div> <br><div id='spaceShipTable' style=' display: inline-block; position:absolute; '></div> <div id='viewSapceShipEsca' style=' display: inline-block; position:absolute; '> </div>  <div id='viewFlotte1' style=' display: inline-block; position:absolute; '></div> <div id='viewFlotte2' style=' display: inline-block; position:absolute; '></div>  <button id='b1'  style='position:absolute;' onclick='runSimulation()'> lancer la simulation</button> "
htmlPage += " <div style='display: inline-block; position:absolute;' id='resultGeneral'> <div id='result' style=' display: inline-block; position:relative; '></div> <br> <div id='moreDetaileResult' style=' display: inline-block; position:relative; '></div> </div> <div id = 'di1' style ='display: inline-block; position:absolute;'> Nombre d'it&eacute;rations <input id='i1' style='position:relative;' type='number' > <br>  (un grand nombre augmente la pr&eacute;cision) <br>  afficher automatiquement les vaisseaux restant <input id='autoMoreDetails' type='checkbox' checked=true> </div>"
htmlPage += " <div style='display: inline-block; position:absolute;' id='tech1'> </div> <div style='display: inline-block; position:absolute;' id='tech2'> </div>"


htmlPage += "<div id='saveOptionDiv' style='display: inline-block; position:absolute;'> </div>"

htmlPage += "<div style='display: inline-block; position:absolute;' id='lostDiv'> </div> "
// this is the html main part
// may change <= unreadable

//resultGeneral moreDetaileResult


function drawPage(){
    $("body").innerHTML = htmlPage;
    
}