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


/*var roleList=[
	    ["132106417703354378", "@everyone",null],
	    ["132106449613619200", "Administrateur",null],
	    ["132110152655568896", "Vérifié",-1],
	    ["132114348947537921", "Modérateur",null],
	    ["133235600248537088", "Bot",null],
	    ["133951475813449728", "Empire",1],
	    ["133951949107232768", "Gouvernement Empire",null],
	    ["133952036243767296", "Gouvernement Ligue",null],
	    ["133952080518840320", "Gouvernement Neo",null],
	    ["133975813199495168", "Seldare",8],
	    ["133976248199151616", "Neo-Humaniste",11],
]*/

//exports.roleList = roleList;

exports.adminRoleId = {id:"132106449613619200",name:"Administrateur"}
exports.modoRoleId = {id:"132114348947537921",name:"Modérateur"}
exports.verified = {id:"132110152655568896",name:"Vérifié"}

exports.getRoleIdByFactionColor = function (color){
    if (color==1) {
	return {id:"133951475813449728",name:"Empire"};
    }
    else if (color==8) {
	return {id:"133975813199495168",name:"Seldare"};
    }
    else if (color==11) {
	return exports.neo;//{id:"133976248199151616",name:"Neo-Humaniste"};
    }
    else if (color==3) {
	return exports.negore;
    }
    else if (color==6) {
	return exports.aphera;
    }
    else if (color==7) {
	return exports.synelle;
    }
    else if (color==2) {
	return exports.kovahk;
    }
    else if (color == 4) {
	return exports.cardan;
    }
    else if (color == 9) {
		return exports.nvnerve;
    }
	else if (color == 10) {
		return exports.mago;
    }
	else if (color == 12) {
		return exports.imp;
    }
    else{
		return {id:undefined,name:undefined};
    }
}
exports.getFactionColorByRoleId = function (roleId){ // retourne 0 si ce n'est pas un faction rôle
    
    if (roleId=="133951475813449728") {
	return 1;
    }
    else if (roleId=="133975813199495168") {
	return 8;
    }
    else if (/*roleId=="133976248199151616"*/roleId==exports.neo.id ) {
	return 11;
    }
    else if (roleId == exports.negore.id) {
	return 3;
    }
    else if (roleId == exports.aphera.id) {
	return 6;
    }
    else if (roleId == exports.synelle.id) {
	return 7;
    }
    else if (roleId==exports.kovahk.id) {
	return 2;
    }
    else if (roleId == exports.cardan.id) {
	return 4;
    }
    else if (roleId == exports.nvnerve.id) {
	return 9;
    }
	else if (roleId == exports.mago.id) {
		return 10;
    }
	else if (roleId == exports.imp.id) {
		return 12;
    }
    else{
		return 0;
    }
    
}


exports.negore ={id:"265898695566819329",name:"Negore"};  //3
//exports.aphera = {id:"168733199306981377",name:"Aphéra"}; //6
exports.aphera = {id:"265898673014046723",name:"Aphéra"}; //6

exports.synelle = {id:"265898625995898881",name:"synelle"}; //7
exports.kovahk = {id:"265897877241331712",name:"kovahk"}; //2

//exports.synelle = {id:"168733261093142528",name:"synelle"}; //7
//exports.kovahk = {id:"168733329087135744",name:"kovahk"}; //2

//exports.cardan = {id:"199846296188616704",name:"cardan"}; //4
exports.nvnerve = {id:"199847043089301505",name:"nvnerve"}; //9
//exports.seldare = {id:"133975813199495168",name:"seldare"}; //8

exports.empire = {id:"133951475813449728",name:"Empire"}; //1

exports.cardan = {id:"232363292520218624",name:"cardan"}; //4
exports.neo = {id:"232363434853924864",name:"neo"}; //9
exports.seldare = {id:"232363197334683659",name:"seldare"}; //8
exports.mago = {id:"232363534514651137",name:"mago"}; //10
exports.imp = {id:"232362776666963979",name:"imp"}; //12


exports.apheraServerRoleId = "265150450465112064"//"168707014615236609";
exports.kovahkServerRoleId = "265129056293355521"//"168710784493289472";
exports.synelleServerRoleId = "265144442720223232"//"168706212093755394";
exports.empireServerRoleId = "168712895687950337";
exports.neoServerRoleId = "168715579467890688";

exports.cardanServerRoleId = "199888091928854528";
exports.seldareServerRoleId = "199868251386150913";
exports.empireS11ServerRoleId = "199887062613229578";
exports.nvnerveServerRoleId = "199887253558919169";


exports.cardanServerRoleIds12 = "199846296188616704"
exports.seldareServerRoleIds12 = "230282328323260416"
exports.magoServerRoleIds12 = "230329080065687552"
exports.neoServerRoleIds12= "230313452822855680"
exports.impServerRoleIds12 = "230274263377117184"
exports.negoreServerRoleId = "265118928315875329";

exports.getRoleIdByFactionColorFactionServer = function (color){
    if (color==1) {
	return exports.empireS11ServerRoleId;
    }
    if (color==3) {
	return exports.negoreServerRoleId;
    }
    else if (color==11) {
	return exports.neoServerRoleId;
    }
    else if (color==6) {
	return exports.apheraServerRoleId;
    }
    else if (color==7) {
	return exports.synelleServerRoleId;
    }
    else if (color==2) {
	return exports.kovahkServerRoleId;
    }
    else if (color == 4) {
	    return exports.cardanServerRoleId;
    }
    else if (color == 8) {
	    return exports.seldareServerRoleId;
    }
    else if (color == 9) {
	    return exports.nvnerveServerRoleId;
    }
    else{
	return undefined;
    }
    /*
     * TODO
     */
}

exports.isGouveRole=function(role){
    return (role=="133951949107232768" || role =="133952036243767296" || role=="133952080518840320");
}
exports.evryoneRole = {id:"132106417703354378",name:"@everyone"};

exports.banRole = {id:"152820640196329472",name:"bannis"}
// 11 néo
// 8 ligue
// 1 empire
