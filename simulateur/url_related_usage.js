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


function opperationBasedOnUrl(){ // the data after ? 
    var badUrl = false;
    try{
        urlData = getUrlData();
        
        urlDataArray = urlData.split(";");
        
        for(var i in urlDataArray){
            
            var tempData = urlDataArray[i].split("=");
            if (tempData.length ==2) {
                
                if (tempData[0]=="d") {
                    
                    fillFlotte(defenderFlotte,tempData[1].split(","));
                }
                else if (tempData[0]=="a") {
                    fillFlotte(attackerFlotte,tempData[1].split(","));
                }
                else{
                    badUrl=true;
                }
                
                
                
            }
            else{
                badUrl=true;
            }
            
        }
    }
    
    catch(e){
        badUrl = true;
    }
    finally{
        
        return badUrl;
    }
}

function getUrlData(){
    var tempUrl = window.location.href;
    arrayUrl = tempUrl.split("?");
    
    if (arrayUrl.length == 1) {
        return null;
    }
    else{
        return arrayUrl[1];
    }
}