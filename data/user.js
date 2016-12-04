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


function userC (userIDp,namep,isAdminp,isModop,isBanp,mpChannelIDp){
	this.userID =userIDp; // user id de la personne
	this.name = namep; // son pseudo
	this.isAdmin = isAdminp; // est admin
	this.isModo = isModop; // est modo
	this.isBan = isBanp; // est ban
	this.mpChannelID = mpChannelIDp || "" // son channel de mp avec le bot
}


var userList = [new userC("93784478299725824","ChickenStorm",true,true,false,"133315338774380544"),
			new userC("132783770532184064","Oxymore",true,true,false,""),
			new userC("128272446259200000","luneverte",false,true,false,""),
			new userC("132931838841716736","Sufx et Whab",false,true,false),
			new userC("92374890794975232","Liador",true,true,false,""),
			new userC("127830681492520960","Zahius",false,true,false,"")
			]
exports.users = userList;


//exports.users = [];
