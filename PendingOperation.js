/*
Copyright 2016 ChickenStorm


This file is part of Chicken Bot.

    Foobar is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Chicken Bot is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with Chicken Bot.  If not, see <http://www.gnu.org/licenses/>.

*/

'use strict'

var pendingOperationArray = []; // liste des opération
var timeoutForPending =750; // temps en ms entre chaque opération

var hasPendigOp = false

exports.addOpperation = function(callBack,arrayVariable){
    pendingOperationArray.push([callBack,arrayVariable]);
    checkOperation();
}

exports.addOpperationPrio = function(callBack,arrayVariable){
    pendingOperationArray.unshift([callBack,arrayVariable]);
    checkOperation();
}

function checkOperation() {
    if (! hasPendigOp) {
	hasPendigOp = true;
	doOperation();
    }
    else{
	
    }
}

function doOperation(){
    if (pendingOperationArray.length >=1) {
	var op = pendingOperationArray.shift();
	//console.log(op[0].toString()+"  "+op[1]+ "   "+Date());
	try{
	    if (op[1]!=undefined) {
		op[0](op[1]);
	    }
	    else{
		op[0]();
	    }
	}
	catch(e){
	    console.log("error in pendingOperation : "+e)
	}
	hasPendigOp = true; // to be safe
	setTimeout(function(){doOperation();},timeoutForPending);
	
    }
    else{
	hasPendigOp = false;
    }
    
    
    
    
}

/*function PendingOperationObject() {
    
}*/

