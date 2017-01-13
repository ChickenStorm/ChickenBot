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


var globalTimoutSaveOption=0;



function displayTable(arrayToDisapay,arrayStyle) { // ceci prend deux array 2-dimentionelle et retourne un tableau en html
    var tempTextTable = "<table style='background-color :white' >";
    
    for (var i in arrayToDisapay) {
        var iS = i;
        tempTextTable = tempTextTable +"<tr>";
        
        for (var j in arrayToDisapay[i]) {
            ///var temp = ""
            
            var jS = j; // because j in in arrayToDisapay[i] and same for i in arrayToDisapay                                                               &eacute; in utf-8
            tempTextTable = tempTextTable +"<td style='border:solid; border-width: thin; "+ arrayStyle[iS][jS]+" ' >" + (arrayToDisapay[i][j]) + "</td>";
            
        }
        
        tempTextTable = tempTextTable +"</tr>";
    }
    
    tempTextTable = tempTextTable + "</table>" ;
    return tempTextTable;
}


function positionEllementHTMLPage(width){ // position les éllements sur la page 
    
    
    
    
    
    
    $("spaceShipTable").style.left = width-30-750 +"px" ;
    $("spaceShipTable").style.top = "320px"
    
    $("tech1").style.top = "320px"
    $("tech2").style.top = "910px"
    $("viewFlotte1").style.top = "540px";
    $("viewFlotte1").style.height = "100px";
    //$("viewFlotte1").style.width = w-30-900-100+ "px";
    //$("viewFlotte2").style.width = w-30-900-100+ "px";
    $("viewFlotte2").style.top = parseInt($("viewFlotte1").style.top) + parseInt($("viewFlotte1").style.height)+500+"px";
    $("viewSapceShipEsca").style.left = "480px";
    $("viewSapceShipEsca").style.top = "320px";
    $("b1").style.left = "750px";
    $("b1").style.top = "370px";
    
    $("resultGeneral").style.left = "600px";
    $("resultGeneral").style.top = "420px";
    //$("resultGeneral").style.width = "600px"
    
    $("di1").style.top  = "290px";
    $("di1").style.left  = "750px";
    $("i1").defaultValue = 1000;
    $("i1").style.left  = "10px";
    
    $("generalInfos").style.top = "20px";
    $("generalInfos").style.left = "300px";
    $("generalInfos").innerHTML = "<p style = 'font-size:  20px;' >Simulateur de combat pour Asylamba. <br>Version "+version +"  <!--<b style='color: red'>FIABILITE EN COUR DE VERIFICATION EN ATTENDANT NE PAS SE FIER. </b>  </p>--><p style='color: black' style='display: block;'> Avertissement : les donn&eacute;e fournies par le simulateur ne sont pas garanties &ecirc;tre juste ni &agrave; jour.<br> L'exc&egrave;s de simulateur peut nuir &agrave; la sant&eacute; (regardez; Sojiro)</p>";
    
    
    $("saveOptionDiv").style.top = "1460px"
    $("saveOptionDiv").style.height = "80px"
    
    $("author").style.left = "800px"
    //$("author").style.top = "900px"
    $("author").style.width = "800px" 
    $("author").innerHTML = "chicken"
    
    $("author").innerHTML = "made by <div style='font: 7px Courier New'>"+chickenStormTextArrax.join("<br>")+"</div>"
    //$("author").style.font="7px Courier New"
    /*try{
        
        if (getVersionUS() == userScriptLastVersion) {
            $("generalInfos").innerHTML += "user script &agrave; jour."
        }
        else{
            $("generalInfos").innerHTML += "l'user script n'est pas &agrave; jour. T&eacute;l&eacute;chargez le <a href='https://github.com/ChickenStorm/Asylamba-Combat-Simulator/raw/master/userScript/simulator_user_script.user.js'>ici</a>."
        }
        
    }*/
    
    $("generalInfos").innerHTML += "<p id='UserScriptMessage'>Vous n'avez pas encore l'user script ou il n'est pas &agrave; jour. T&eacute;l&eacute;chargez le <a href='https://github.com/ChickenStorm/Asylamba-Combat-Simulator/raw/master/userScript/simulator_user_script.user.js'>ici</a>.</p>";
    
    $("lostDiv").style.width = "800px";
    $("lostDiv").style.left = "20px";
    $("lostDiv").style.top = "1550px";
    
    drawLostDiv();
    //drawSaveOption();
    
    //" "
    
}

function drawSaveOptionGeneral(){
    clearTimeout(globalTimoutSaveOption)
    $("saveOptionDiv").innerHTML = "<button onclick='saveFlotte(defenderFlotte)'> sauvgarder Flotte en d&eacute;fense </button> "
    $("saveOptionDiv").innerHTML += "<button onclick='saveFlotte(attackerFlotte)'> sauvgarder Flotte en attaque </button> ";
    $("saveOptionDiv").innerHTML += "<br><button onclick='showLoadMenu(defenderFlotte)'> charger Flotte en d&eacute;fense </button> ";
    $("saveOptionDiv").innerHTML += "<button onclick='showLoadMenu(attackerFlotte)'> charger Flotte en attaque </button> ";
    $("saveOptionDiv").innerHTML += "<br><button onclick='showCookieDeletMenu()'> sumprimer des flottes des cookies </button> ";
    
}


function showLoadMenu(flotte){
    
    if (flotte.id == 0) {
        var flotteDescritption = "defenderFlotte";
        
    }
    else{
        var flotteDescritption = "attackerFlotte";
    }
    
    var cText = document.cookie;
    var cArray = cText.split(";");
    
    $("saveOptionDiv").innerHTML ="";
    
    var regExpFlotte = new RegExp("^flotte*");
    
    for(var i in cArray){
        
        var temp = cArray[i].split("=");
        
        if (regExpFlotte.test(temp[1])) {
            
            $("saveOptionDiv").innerHTML += "<button onclick='loadFlotteFromACookie(\""+temp[0]+"\","+flotteDescritption+");drawSaveOptionGeneral();'> "+temp[0]+" </button>";
        }
    }
    
    $("saveOptionDiv").innerHTML += "<br> <button onclick='drawSaveOptionGeneral();'> back </button> ";
    clearTimeout(globalTimoutSaveOption);
    globalTimoutSaveOption = setTimeout(drawSaveOptionGeneral,10000);
    
}

function showCookieDeletMenu(){
    
    
    var cText = document.cookie;
    var cArray = cText.split(";");
    
    $("saveOptionDiv").innerHTML ="";
    
    var regExpFlotte = new RegExp("^flotte*");
    
    for(var i in cArray){
        
        var temp = cArray[i].split("=");
        
        if (regExpFlotte.test(temp[1])) {
            
            $("saveOptionDiv").innerHTML += "<button onclick='deleteCookie(\""+ temp[0] +"\"); showCookieDeletMenu()'> "+temp[0]+" </button>";
        }
    }
    
    $("saveOptionDiv").innerHTML += "<br> <button onclick='drawSaveOptionGeneral();'> back </button> ";
    clearTimeout(globalTimoutSaveOption);
    globalTimoutSaveOption = setTimeout(drawSaveOptionGeneral,10000);
}

function drawInterface(){ // utiliser par la plus part des fonction qui modifie l'affichage
    
    drawSpaceShipTable();
    
    
    
    /*
    var tempCheckedValue1 = false;
    var tempCheckedValue2 = false;
    var tempBF1 = 0;
    var tempBF2 = 0;
    
    if ($("bonnusF1")!=null && !isNaN(parseInt($("bonnusF1").value))) {
        tempBF1=$("bonnusF1").value;
    }
    if ($("bonnusF2")!=null && !isNaN(parseInt($("bonnusF2").value))) {
        tempBF2=$("bonnusF2").value;
    }
    
    if ($("hasKBonusF1")!=null) {
        tempCheckedValue1=$("hasKBonusF1").checked;
    }
    if ($("hasKBonusF2")!=null) {
        tempCheckedValue2=$("hasKBonusF2").checked;
    }*/
    //                                                                                                        <button onclick='swapFlotte()'>swap flottes </button>
    $("viewFlotte1").innerHTML = "<button onclick='inversFlotte()'> inverser les flottes</button><br>Cliquez sur une casse pour choisir l'escadrille. <br>flotte en d&eacute;fense. <br>"+ HTMLCodeFlotte(defenderFlotte);
    
    $("viewFlotte2").innerHTML = "flotte en attaque.<br>"+HTMLCodeFlotte(attackerFlotte);
    
    //$("viewFlotte1").innerHTML = "Cliquez sur une casse pour choisir l'escadrille. <br>flotte en d&eacute;fense. <br>Bonus technologique d'&eacute;vitement <input id='bonnusF1'> <br>Bonus de Kovahk <input id='hasKBonusF1' type='checkbox'>  <br><br>"+ HTMLCodeFlotte(defenderFlotte);

    //$("viewFlotte2").innerHTML = "flotte en attaque. <br>Bonus technologique d'&eacute;vitement <input id = 'bonnusF2'> <br>Bonus de Kovahk <input id='hasKBonusF2' type='checkbox'> <br><br>"+HTMLCodeFlotte(attackerFlotte);
    /*
    if ($("hasKBonusF1") != null && $("hasKBonusF2")!=null && $("bonnusF2")!= null && $("bonnusF1")!= null ) {
        $("hasKBonusF1").checked = tempCheckedValue1;
        $("hasKBonusF2").checked = tempCheckedValue2;
        
        
        $("bonnusF1").defaultValue =tempBF1;
        $("bonnusF2").defaultValue =tempBF2;
    }
    */
    
    drawEscaView();//$("viewSapceShipEsca")
    
    // TODO fair une fonction à part
    try {
        setTech(defenderFlotte);
        setTech(attackerFlotte);
    } catch(e) {
        alert(e);
    }
}


function drawSpaceShipTable(){ // dessin les tableau des types de vaisseau
    
    
    var arrayToDraw = [["nom","attaque","d&eacute;fense","vitesse","coque","PEV","type"]];
    var styleArray = [["width : 100px;text-align: center;","width : 70px;text-align: center;","width : 70px;text-align: center;","width : 70px;text-align: center;","width : 70px;text-align: center;","width : 70px;text-align: center;","width : 70px;text-align: center;"]];
    /**for (var j in spaceShipType[0]) {
        arrayToDraw[0].push(j); // peut etre changer
        styleArray[0].push("width : 100px;text-align: center;");
    }*/
    var j=0;
    for (var i in spaceShipType) {
        arrayToDraw.push([]);
        styleArray.push([]);
        ++j;
        if (shipIdModification != j) {
            
            
            
            for (var l=0; l<8;l++){
                
                styleArray[j].push("width : 70px;text-align: center;' onclick ='tableSpaceShipClick(" +i+""  + ",event)");
                
            }
            
            //alert(spaceShipType[i].name)
            styleArray[j][1] = "width : 210px;text-align: center;' onclick ='tableSpaceShipClick(" +i+""  + ",event)";
            //styleArray[j].push("width : 100px;text-align: center;","width : 210px;text-align: center;","width : 100px;text-align: center;","width : 100px;text-align: center;","width : 100px;text-align: center;","width : 100px;text-align: center;");
            styleArray[j][7] = "width : 70px;text-align: center;"
            
            
            arrayToDraw[j].push(spaceShipType[i].name);
            
            var attackText="";
            for (var k =0; k < spaceShipType[i].cannon.attack.length; k++ ) {
                attackText +=  spaceShipType[i].cannon.attack[k]
                if (spaceShipType[i].cannon.number[k] !=1) {
                    attackText += " * " + spaceShipType[i].cannon.number[k]
                }
                attackText+=" + "
            }
            attackText = attackText.substring(0,attackText.length-2)
            arrayToDraw[j].push(attackText);
            arrayToDraw[j].push(spaceShipType[i].defense,spaceShipType[i].speed,spaceShipType[i].maxHull,spaceShipType[i].pev,spaceShipType[i].typeName)
            
            arrayToDraw[j].push("<button onclick='modifiAShipButton("+(j)+")'> modifier </button>");
        }
        else{
            
            
            
            for (var l=0; l<8;l++){
                
                styleArray[j].push("width : 70px;text-align: center;");
                
            }
            
            //alert(spaceShipType[i].name)
            styleArray[j][1] = "width : 210px;text-align: center;";
            //styleArray[j].push("width : 100px;text-align: center;","width : 210px;text-align: center;","width : 100px;text-align: center;","width : 100px;text-align: center;","width : 100px;text-align: center;","width : 100px;text-align: center;");
            styleArray[j][7] = "width : 70px;text-align: center;"
            
            
            //arrayToDraw[j].push("<input id='inMod1' value = '"+spaceShipType[i].name+"' style = 'width : 70px'>");
            arrayToDraw[j].push(spaceShipType[i].name);
            
            var attackText="";
            for (var k =0; k < spaceShipType[i].cannon.attack.length; k++ ) {
                attackText +=  spaceShipType[i].cannon.attack[k]
                if (spaceShipType[i].cannon.number[k] !=1) {
                    attackText += " * " + spaceShipType[i].cannon.number[k]
                }
                attackText+=" + "
            }
            attackText = attackText.substring(0,attackText.length-2)
            
            arrayToDraw[j].push("<input id='inMod2' value = '"+attackText+"' style = 'width : 210px'>");
            arrayToDraw[j].push("<input id='inMod3' value = '"+spaceShipType[i].defense+"' style = 'width : 70px'>","<input id='inMod4' value = '"+spaceShipType[i].speed+"' style = 'width : 70px'>","<input id='inMod5' value = '"+spaceShipType[i].maxHull+"' style = 'width : 70px'>","<input id='inMod6' value = '"+spaceShipType[i].pev+"' style = 'width : 70px'>",spaceShipType[i].typeName)
            
            arrayToDraw[j].push("<button onclick='saveAModif()'> sauvegarder </button>");
        }
    }
    arrayToDraw.push(["<button onclick='addNewType();'>ajouter un nouveau type</button> (m&ecirc;me format qu'au dessus et &eacute;vitez les accents dans le nom)"]);
    styleArray.push(["text-align:center;' colspan='7'; onclick ='tableSpaceShipClick(" +0+""  + ",event)"]);
    
    /*
     *TODO fair entrée nouveau type
     */
    var tempTextSelect = "<select style='width : 70px;' id='newShipInput7'>  <option value='Chasseur'>Chasseur</option> <option value='Corvette'>Corvette</option> <option value='Fregate'> Fregate</option> <option value='Destroyer'> Destroyer</option> <option value='Croiseur'> Croiseur</option></select> "
    arrayToDraw.push(["<input style='width : 93px;' id='newShipInput1'>","<input style='width : 200px;' id='newShipInput2'>","<input style='width : 63px;' id='newShipInput3'>","<input style='width : 63px;' id='newShipInput4'>","<input style='width : 63px;' id='newShipInput5'> ","<input style='width : 63px;' id='newShipInput6'> ",tempTextSelect]);
    styleArray.push(["width : 70px;"]);
    
    arrayToDraw.push(["------------- Preset -------------"]);
    styleArray.push(["text-align:center;' colspan='7"]);
    
    arrayToDraw.push(["ender","1cy + 17 ch + 2 pe"]);
    styleArray.push(["text-align:center;' colspan='3'; onclick = 'addEnder()","text-align:center;' colspan='4'; onclick = 'addEnder()"]);
    
    
    
    arrayToDraw.push(["hydre (p&eacute;gase) ","1 hy + 4 pe"]);
    styleArray.push(["text-align:center;' colspan='3'; onclick = 'addHyPe()","text-align:center;' colspan='4'; onclick = 'addHyPe()"]);
    
    arrayToDraw.push(["Ph&eacute;nix (p&eacute;gase)","1 ph +  pe"]);
    styleArray.push(["text-align:center;' colspan='3'; onclick = 'addPhPe()","text-align:center;' colspan='4'; onclick = 'addPhPe()"]);
    
    
    
    $("spaceShipTable").innerHTML = "<p>Cliquez sur une des lignes pour ajouter le vaisseau (shift/maj ajouter 10 vaisseaux). Cliquez sur le tabeau au dessu du tabelau de flotte pour supprimer un vaisseau.<\p>";
    $("spaceShipTable").innerHTML += displayTable(arrayToDraw,styleArray);
}


function HTMLCodeFlotte(flotte){
    
    var arrayToDraw = [];
    var styleArray = [];
    
    for (var i in flotte.ligneArray){
        arrayToDraw.push(["ligne "+ (parseInt(i)+1) ]);
        styleArray.push(["height: 50px; width: 75px;text-align: center;"]);
        
        for (var j in flotte.ligneArray[i].escadrilleArray) {
            var pevTot = flotte.ligneArray[i].escadrilleArray[j].pev;;
            
            /*for (k in flotte.ligneArray[i].escadrilleArray[j].spaceShipArray) {
                pevTot += flotte.ligneArray[i].escadrilleArray[j].spaceShipArray[k].type.pev;
            }*/
            
            arrayToDraw[arrayToDraw.length-1].push(pevTot);
            if (selectedFlotte == flotte.id && selectedLigne == i && selectedEsc == j) {
                styleArray[arrayToDraw.length-1].push("height: 50px; width: 50px;text-align: center;background-color: lightblue; ' onclick ='tableFlotteClick(" + flotte.id+ "," + i + "," + j + ")");
            }
            else{
                styleArray[arrayToDraw.length-1].push("height: 50px; width: 50px;text-align: center;background-color: white;' onclick ='tableFlotteClick(" + flotte.id+ "," + i + "," + j + ")");
            }
            
            
        }
    }
    
    return displayTable(arrayToDraw,styleArray);
    
}


function drawEscaView() { // affiche tout les vaisseau d'une escadrille
    
    arraySpaceShipNumber = [["<button onclick = 'flotteArray[selectedFlotte].ligneArray[selectedLigne].escadrilleArray[selectedEsc].spaceShipArray = []; flotteArray[selectedFlotte].ligneArray[selectedLigne].escadrilleArray[selectedEsc].pev=0; drawInterface();' > clear </button>"]];
    styleArray = [[""]];
    
    if (selectedFlotte!= -1) {
        
        
        var spaceShipTemp = flotteArray[selectedFlotte].ligneArray[selectedLigne].escadrilleArray[selectedEsc].spaceShipArray;
        
        for (var i in spaceShipTemp){
            
            if (arraySpaceShipNumber.length==0) {
                arraySpaceShipNumber.push([spaceShipTemp[i].type.name,1]);
                
                styleArray.push(["width : 75px;text-align: center;' onclick='removeSpaceShipEsc("+i+");","width : 20px;text-align: center;' onclick='removeSpaceShipEsc("+i+");"]);
            }
            else{
                var isInside = false;
                for(var j in arraySpaceShipNumber){
                    
                    
                    if (arraySpaceShipNumber[j][0] == spaceShipTemp[i].type.name) {
                        ++arraySpaceShipNumber[j][1];
                        isInside = true;
                    }
                    
                    
                }
                
                if (!isInside) {
                    
                    arraySpaceShipNumber.push([spaceShipTemp[i].type.name,1]);
                    styleArray.push(["width : 75px;text-align: center; ' onclick ='removeSpaceShipEsc("+i+");","width : 20px;text-align: center;' onclick='removeSpaceShipEsc("+i+");"]);
                    
                }
            }
            
        }
        
        $("viewSapceShipEsca").innerHTML = displayTable(arraySpaceShipNumber,styleArray);
    }
}

function drawTechTable(){
    const inputSize = 50
    const LISTE_OF_SHIP_TYPE = ["Chasseur","Corvette","Fregate","Destroyer","Croiseur"];
    var arrayDisplay = [["Bonus (niveau de technologie)","vitesse","attaque","d&eacute;fense"]]; //vitesse attque defense
    var arrayDisplay2 = [["Bonus (niveau de technologie)","vitesse","attaque","d&eacute;fense"]]; //vitesse attque defense
    var styleArray = [[""],[""],[""],[""],[""],[""],[""]];
    

    for (var i =0;i<=4;++i){
        arrayDisplay.push([LISTE_OF_SHIP_TYPE[i],"<input style='width : "+inputSize+"px;' id='"+"1*"+LISTE_OF_SHIP_TYPE[i]+"*"+arrayDisplay[0][1]+"'>","<input style='width : "+inputSize+"px;' id='"+"1*"+LISTE_OF_SHIP_TYPE[i]+"*"+arrayDisplay[0][2] +"'>","<input style='width : "+inputSize+"px;' id='"+"1*"+LISTE_OF_SHIP_TYPE[i]+"*"+"defense"+"'>"]);
        arrayDisplay2.push([LISTE_OF_SHIP_TYPE[i],"<input style='width : "+inputSize+"px;' id='"+"2*"+LISTE_OF_SHIP_TYPE[i]+"*"+arrayDisplay[0][1]+"'>","<input style='width : "+inputSize+"px;' id='"+"2*"+LISTE_OF_SHIP_TYPE[i]+"*"+arrayDisplay[0][2]+"'>","<input style='width : "+inputSize+"px;' id='"+"2*"+LISTE_OF_SHIP_TYPE[i]+"*"+"defense"+"'>"]);
        //alert("1*"+lsiteOfShipType[i]+"*"+arrayDisplay[0][1])
    }
    
    $("tech1").innerHTML = displayTable(arrayDisplay,styleArray)+ " Bonus de Kovahk <input id='1*Kovahk' type='checkbox'> " + "<br>" +"Bonus de Synelle/Empire <input id='1*SE' type='checkbox'> " ;
    $("tech2").innerHTML = displayTable(arrayDisplay2,styleArray)+ " Bonus de Kovahk <input id='2*Kovahk' type='checkbox'> " + "<br>" +"Bonus de Synelle/Empire <input id='2*SE' type='checkbox'> ";
    
    const LISTE_OF_SHIP = ["Chasseur","Corvette","Fregate","Destroyer","Croiseur"];
    const LISTE_OF_TECH_TYPE = ["vitesse","attaque","defense"];
    
    for( var i in LISTE_OF_SHIP){
        for (var j in LISTE_OF_TECH_TYPE){
            
            $(1+"*"+LISTE_OF_SHIP[i]+"*"+LISTE_OF_TECH_TYPE[j]).defaultValue =0;
            $(2+"*"+LISTE_OF_SHIP[i]+"*"+LISTE_OF_TECH_TYPE[j]).defaultValue =0;
        }
    }
    
}



function drawSimulationResult(numberOfSimulation,winingOnlyFlotte1,winingOnlyFlotte2,loosingFlotte1AndFlotte2,totalSimulationLoop){
        drawInterface();
       
       //drawResult(simulationArrayResult);
       
        $("moreDetaileResult").innerHTML ="";
        var tempArray = [];
        var tempStyleArray = [];
        tempArray.push(["nombre de simulations","seul flotte attaquante victorieuse","seul flotte en defense victorieuse","exaequo (les deux sont d&eacute;truites)","nombre moyen de tour"]);
        tempStyleArray.push(["width:100px","width:100px","width:100px","width:100px","width:100px"]);
        tempArray.push([numberOfSimulation,winingOnlyFlotte2 + " ( "+ winingOnlyFlotte2/ numberOfSimulation+" )",winingOnlyFlotte1 + " ("+ winingOnlyFlotte1/ numberOfSimulation+" )",loosingFlotte1AndFlotte2 +" ( "+ loosingFlotte1AndFlotte2/numberOfSimulation +" )",totalSimulationLoop/numberOfSimulation])
        tempStyleArray.push(["","","","",""]);
        tempArray.push(["<button onclick='drawAdvanceDetail()' id='b1Detail'> afficher plus de d&eacute;tails </button>"]);
        tempStyleArray.push(["text-align: center;' colspan= '5"]);
        
       
       
        $("result").innerHTML = displayTable(tempArray,tempStyleArray);
        
        
        
}



function drawAdvanceDetail(){//affiche plus de détail de la sim. est exécuter quand l'utilisateur appuis sur "afficher plus de détails"
    //alert("")
    
    var tempArrayFlotte1 = [["Nom","nombre moyen restant"]];
    var styleArrayFlotte1 =[["text-align: center;","text-align: center;"]];
    
    $("b1Detail").style.visibility = "hidden";
    
    for (var l in simulationArrayResult){
        for (var iLine in simulationArrayResult[l].flotte1.ligneArray){
            for (var iEsc in simulationArrayResult[l].flotte1.ligneArray[iLine].escadrilleArray){
                var spaceShipTemp = simulationArrayResult[l].flotte1.ligneArray[iLine].escadrilleArray[iEsc].spaceShipArray;
                
                for (var i in spaceShipTemp){
                    
                    if (tempArrayFlotte1.length==0) {
                        tempArrayFlotte1.push([spaceShipTemp[i].type.name,1]);
                        
                        styleArrayFlotte1.push(["text-align: center;","text-align: center;"]);
                    }
                    else{
                        var isInside = false;
                        for(var j in tempArrayFlotte1){
                            
                            
                            if (tempArrayFlotte1[j][0] == spaceShipTemp[i].type.name) {
                                ++tempArrayFlotte1[j][1];
                                isInside = true;
                            }
                            
                            
                        }
                        
                        if (!isInside) {
                            
                            tempArrayFlotte1.push([spaceShipTemp[i].type.name,1]);
                            styleArrayFlotte1.push(["text-align: center;","text-align: center;"]);
                            
                        }
                    }
                    
                }
            }
        }
    }
    
    for (var iDiv = 1 ; iDiv < tempArrayFlotte1.length;++iDiv){
        tempArrayFlotte1[iDiv][1] = tempArrayFlotte1[iDiv][1]/numberOfSimulation;
    }
    
    var tempArrayFlotte2 = [["Nom","nombre moyen restant"]];
    var styleArrayFlotte2 =[["text-align: center;","text-align: center;"]];
    
    for (var l in simulationArrayResult){
        for (var iLine in simulationArrayResult[l].flotte2.ligneArray){
            for (var iEsc in simulationArrayResult[l].flotte2.ligneArray[iLine].escadrilleArray){
                var spaceShipTemp = simulationArrayResult[l].flotte2.ligneArray[iLine].escadrilleArray[iEsc].spaceShipArray;
                
                for (var i in spaceShipTemp){
                    
                    if (tempArrayFlotte2.length==0) {
                        tempArrayFlotte2.push([spaceShipTemp[i].type.name,1]);
                        
                        styleArrayFlotte2.push(["text-align: center;","text-align: center;"]);
                    }
                    else{
                        var isInside = false;
                        for(var j in tempArrayFlotte2){
                            
                            
                            if (tempArrayFlotte2[j][0] == spaceShipTemp[i].type.name) {
                                ++tempArrayFlotte2[j][1];
                                isInside = true;
                            }
                            
                            
                        }
                        
                        if (!isInside) {
                            
                            tempArrayFlotte2.push([spaceShipTemp[i].type.name,1]);
                            styleArrayFlotte2.push(["text-align: center;","text-align: center;"]);
                            
                        }
                    }
                    
                }
            }
        }
    }
    
    for (var iDiv = 1 ; iDiv < tempArrayFlotte2.length;++iDiv){
        tempArrayFlotte2[iDiv][1] = tempArrayFlotte2[iDiv][1]/numberOfSimulation;
    }
    
    
    
    $("moreDetaileResult").innerHTML ="Flotte en d&eacute;fense <br>"+ displayTable(tempArrayFlotte1,styleArrayFlotte1) + "<br> flotte en attaque <br>"+displayTable(tempArrayFlotte2,styleArrayFlotte2);
}

function drawLostDiv(){
    var arrayDraw = [["nom","nombre"]];
    var arrayDrawStyle = [[" "," "]];
    
    for (var i=0; i<12;++i){
        arrayDraw.push([spaceShipType[i].name,"<input type='number' id='lost" + i + "'  value=0>"]);
        arrayDrawStyle.push(["",""]);
    }
    
    $("lostDiv").innerHTML = displayTable(arrayDraw,arrayDrawStyle) +"<button onclick = 'computeLost()'> calculer les pertes</button> <label id='labelLost'> 0 </label> "
    
}
function computeLost(){
    var lost =0;
    for (var i=0; i<12;++i){
        lost +=  spaceShipType[i].price* parseInt($("lost" + i).value)
    }
    $("labelLost").innerHTML = lost.toLocaleString();
}
