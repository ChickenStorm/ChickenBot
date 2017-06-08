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

//Empire 1, Cardan 4, Ligue 8, Nouvelle-Nerve 9

//var working = true;
//'use strict';

var http = require('http'); // pour le serveur http
var url = require("url");
var querystring = require('querystring');
var DiscordClient = require('discord.io'); // API discord
var os = require('os'); // os pour les retour à la ligne
var fs = require("fs"); // file système pour lire / écire dans des fichier
var userList =  require('./data/user.js');
var role = require('./data/role.js');
var servers = require('./data/servers.js');
var texts=require('./data/texts-facts.js')
var channel = require('./data/channel.js')
var auth = require('basic-auth');
var pendingOperation = require('./PendingOperation.js');
//var CircularJSON = require('circular-json')
/******************************************************************/
var bot; // le bot
var enable = true; // détermine si le bot répond au commande dans discord
var forceEnable = false; //
var forceDisable = false; // au mieux les deux ne sont pas a true en même temps
// sinon c'est forceDisable qui prime
var statusRefreshIntervalRef; // ref du setTimout pour le refresh du statu

var statusRefreshInterval = 60000; //in millisecond
//1000000 (1000 sec => 16.6667 minutes)

var roleServerAssingIntervalRef; // référence de l'interval pour ajouter les rôle au serveur qui n'est pas le root
var roleServerAssingInterval = 60000; // une minutes

var emailBot=""; // email pour le login discord
var passwordBot = ""; // email pour le login discod
var tencBot = ""; // tenc du bot


var loginServ=[]; // login qui sra demander pour le serveur hhtp
var userListFaction = []; // lioste des utilisateurs
//var discordServeurId = "132106417703354378"; // le serveru discord sur le quelle opère le bot
discordServeurId = servers.rootServerId;
var voteArray=[]; // liste des votes
var isConnected = false;
var connectIntervalRef; // connection interval

var isInMaintenance = false


var invitationPrefix= "https://discord.gg"
/*********************************************************************/

var roleListId =[];
var roleListName=[];

var sendData=true; // si le bot envoi des donné sur le serveur http

var debug = true; // fait les log de débug (peux diminuer les capacité)

var loginGet = [] // login pour les reqête get qui sera demander
var switchStatusMessage // function

var posTemp; // position pour envoyer l'invitation
// TODO more reliable
/****************************************************************************/

// macro trouvé sur le net pour trouvé le numéro de la ligne

Object.defineProperty(global, '__stack', {
  get: function(){
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, '__line', {
  get: function(){
    return __stack[1].getLineNumber();
  }
});

/*****************************************************************************/


// Get client IP address from request object ----------------------
// trouvé sur le net

var getClientAddress = function (req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
};

function copieData(data){ // copie des donné mais pas la référence
	return JSON.parse(JSON.stringify(data));
}

// lit les donné de login
fs.readFile('login.txt','ascii', function (err, data) {
	var dataTemp2= data.split(";");
	loginGet = dataTemp2;
})

fs.readFile('loginServeur.txt','ascii', function (err, data) { // lit les login pour le serveur
	var dataTemp2= data.split(";");
	loginServ = dataTemp2;
	dataTemp2 = "";
	fs.readFile('tenc2.txt','ascii',function (err, dataTenc) {
		tencBot = dataTenc;
		dataTenc = "";
		fs.readFile('data/vote.json','utf8', function (err, data) { // lit la liste des votes

			//try{
				voteArray = JSON.parse(data.toString('utf8')); // parse
			//}
			//catch(e){
				//console.log("vote uneradable");
			//}
			fs.readFile('data/user.json','utf8', function (err, data) { // lit la listze des users
				userListFaction = JSON.parse(data.toString('utf8'));
				fs.readFile('login.txt','ascii', function (err, data) { // lit les login du bot
					var dataTemp= data.split(";");
					emailBot = dataTemp[0];
					passwordBot = dataTemp[1];
					data = "";
					dataTemp = [];
					initBot(); // on peux enfin init le bot
				});
			});
		});
	});

});

function backup() {
	pendingOperation.addOpperation(function(args){writeUserList()},[]);
	pendingOperation.addOpperation(function(args){fs.writeFile("./data/user-backup.json",JSON.stringify(userListFaction),function (err) {})},[]);
	pendingOperation.addOpperation(function(args){fs.writeFile("./data/vote.json",JSON.stringify(voteArray),function (err) {})},[]);
	pendingOperation.addOpperation(function(args){fs.writeFile("./data/vote-backup.json",JSON.stringify(voteArray),function (err) {})},[]);

}

function botSendMessage(args){
	/*
	 * args[0] : chanID
	 * args[1] : message
	 */
	/*pendingOperation.addOpperation(function(args){
		bot.sendMessage({
			to: args[0],
			message: args[1]
		});
	},args)*/

	bot.sendMessage({
		to: args[0],
		message: args[1]
	});
}

function botSendMessageBis(chanID,message){
	/*
	 * args[0] : chanID
	 * args[1] : message
	 */
	botSendMessage([chanID,message]);

}

function botAddToRole(args2){

	/**
	 * args[0] : serverID
	 * args[1] : userID
	 * args[2] : roleID
	 */
	pendingOperation.addOpperation(function(args){
		bot.addToRole({
			server: args[0],
			user: args[1],
			role: args[2]
		});
	},args2)

}
function botAddToRoleBis(serverID,userID,roleID){
	botAddToRole([serverID,userID,roleID]);


}

function botRemoveFromRole(args2){
	/**
	 * args[0] : serverID
	 * args[1] : userID
	 * args[2] : roleID
	 */
	pendingOperation.addOpperation(function(args){
		console.log(args);
		bot.removeFromRole({
			server: args[0],
			user: args[1],
			role: args[2]
		});
	},args2);
}
function botRemoveFromRoleBis(serverID,userID,roleID){
	botRemoveFromRole([serverID,userID,roleID]);
}


function writeUserList() {
	fs.writeFile("./data/user.json",JSON.stringify(userListFaction),function (err) {})
}

/*******************************************************************/

function initBot(){ // initilisation du bot et des différents callbacks

	logDebug("systeme","[init] bot initialisation");
	bot = new DiscordClient({ // login
	    autorun: true,
	    email: emailBot,
	    password: passwordBot//,
	    //token: tencBot
	});
	console.log(emailBot+" "+passwordBot);
	passwordBot="";
	tencBot = "";
	emailBot = "";

	switchStatusMessage = function (){ // change le message du bot (sous playing) selon les différents types d'activation
		console.log("refresh status");
		logDebug("status","refresh status");
		if (enable) {
			pendingOperation.addOpperation(function(){
				bot.setPresence({
					idle_since: null,
					game: "Status : enable (online)"
				 });
			});
		}
		else{
			pendingOperation.addOpperation(function(){
				bot.setPresence({
					idle_since: Date.now(),
					game: "Status : disable (online)"
				});
			})
		}
		if (forceEnable) {
			pendingOperation.addOpperation(function(){
				bot.setPresence({
					idle_since: null,
					game: "Status : Force enable (online)"
				});
			})
		}
		if (forceDisable) {
			pendingOperation.addOpperation(function(){
				bot.setPresence({
					idle_since: Date.now(),
					game: "Status : Force disable (online)"
				});
			})
		}
	}


	bot.on('ready', function() { // quand le bot est pret
		isConnected = true;
		console.log(bot.username + " - (" + bot.id + ")");
		logDebug("système","bot ready");


		switchStatusMessage();
		updateUserSlow();
		banManager();
		//backup();


		clearInterval(statusRefreshIntervalRef);
		statusRefreshIntervalRef = setInterval(
						       function(){
								switchStatusMessage();
								updateUserSlow();
								banManager();
								backup();
						       },
							statusRefreshInterval
						       );
		roleServerAssingIntervalRef = setInterval(function(){roleServerAssing();},roleServerAssingInterval)
		/*fs.appendFile('test.txt', JSON.stringify(test)+os.EOL, function (err) {
			if (err) throw err;
			//console.log('The "data to append" was appended to file!');
		});*/


		for (var i in bot["servers"][discordServeurId]["roles"]){
			roleListId.push(i);
			roleListName.push(bot["servers"][discordServeurId]["roles"][i]["name"])
		}
	});

	/*bot.on('message', function(user, userID, channelID, message, rawEvent) {
	fs.appendFile('message.txt', 'user : '+user +'; userID : '+userID+'; channelID : '+channelID+'; message : '+message+os.EOL, function (err) {
	  if (err) throw err;
	  //console.log('The "data to append" was appended to file!');
	});
	console.log(message)
	});*/
	var connectTryInterval = 10000; // temps en miliseconde entre chaque tentative de connection si le bo a été déco
	bot.on('disconnected', function() { // si le bot est déconnecté
		logDebug("system","bot was diconnect form discord")
		isConnected = false
		if (connectIntervalRef != undefined) {
			clearInterval(connectIntervalRef); // arrête l'interval
			connectIntervalRef = undefined;
		}
		connectIntervalRef = setInterval(function(){
			if (isConnected == true) {
				clearInterval(connectIntervalRef); // arrête l'interval
				connectIntervalRef = undefined
			}
			else{
				logDebug("system","attempting to reconnect");
				bot.connect();
			}
		},connectTryInterval)
	});


	bot.on('message', function(user, userID, channelID, message, rawEvent) { // quand un message est envoyer sur une chan ou le bot est


		for(var i in commandManage){ // regarde sur les commandes qui ne sont pas désactivées même si le bot est désactivé
			if (commandManage[i].testInput(user, userID, channelID, message, rawEvent)) {
				commandManage[i].func(user, userID, channelID, message, rawEvent); // exécute la commande si la condition correcte est verifiée
				logDebug("message","command " + message);
			}
		}
		if (!forceDisable && (enable || forceEnable)) { // si le bot est activé ou qu'il est forcé d'être activé et qu'il n'est pas forcé d'être désactivé

			for(var i in commandList){
				if (commandList[i].testInput(user, userID, channelID, message, rawEvent)) {
					commandList[i].func(user, userID, channelID, message, rawEvent); // exécute la commande si la condition correcte est verifiée
					logDebug("message","command " + message);
				}
			}

		}
		if (isInMaintenance && isAdminFunc(userID)) {
			for(var i in commandMaintenance){
				if (commandMaintenance[i].testInput(user, userID, channelID, message, rawEvent)) {
					commandMaintenance[i].func(user, userID, channelID, message, rawEvent); // exécute la commande si la condition correcte est verifiée
					logDebug("message","command " + message);
				}
			}

		}

	});


}



function roleServerAssing(){
	for (var i in userListFaction){
		if (userListFaction[i].pendingRole!= undefined) {



			var newPendingRole=[];
			for (var j in userListFaction[i].pendingRole){
				var serverWorking = userListFaction[i].pendingRole[j].serverId;

				var hasAdd = false;
				for (var us in bot.servers[serverWorking].members){
					if (us == userListFaction[i].userID) {

						hasAdd = true
						botAddToRoleBis(serverWorking,us,userListFaction[i].pendingRole[j].roleId);



					}
				}
				if (!hasAdd) {
					newPendingRole.push(userListFaction[i].pendingRole[j]);
				}
			}

			userListFaction[i].pendingRole = newPendingRole

		}
	}
}



function UserObject(userIDP,serveurP,usernameP,factionColorP,isAdminP,isModoP,isBanP,isInGouvP,dateP,isVerifedP){ // object user
	this.userID =userIDP; // user id dans disncord
	this.serveur=serveurP; // serveur asylamba s+nombre
	this.username=usernameP; // username dans asylamba
	this.factionColor=factionColorP; // numéro de faction dans asylamba
	this.isAdmin=isAdminP;  // est un admin discord
	this.isModo=isModoP;// est un modo discord
	this.isBan=isBanP; // est banni sur discord (not implemented yet)
	this.isInGouv=isInGouvP; // est dans le gouv dans asylamba
	this.dateOfRegister=dateP; // date d'enregistrement (le dernier)
	this.isVerifed = isVerifedP; // est verifié
	this.roleBeforeBan = []; // les rôle avant le ban
	this.banCount =0; // le nombre de ban eu
	this.banUntil =-1; // date jusqu'à ce que l'utilisateur soit déban
	this.banReason = ""; // la raison du ban
	this.avertissement =0;
	this.pendingRole=[]; // rôle to add when users comme to new server
	// structur {roleId:x,serverId:y}
	this.notifList={};
	//logDebug("UserObject","new UserObject ");
}

// peux être utiliser ça comme interface admin du bot => done

var server = http.createServer(function(request, response) { // creation du serveru http

	var page = url.parse(request.url).pathname; // parse l'url pour trouvé la page
	//var params = querystring.parse(url.parse(req.url).query);

	//logHttp("recive message "+CircularJSON.stringify(request));
	logHttp("recive message from IP "+getClientAddress(request) +"; with header : "+JSON.stringify(request.headers));
	//console.log(page);
	if (request.method == 'POST') {
		//logDebug("http","recive POST");
		var body = '';
		request.setEncoding('utf8');

		request.on('data', function (data) {
			body += data;
			// Too much POST data, kill the connection!
			// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB

			if (body.length > 1e6){ // si on a trop de donné
				request.connection.destroy();
				response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/plain'});
				response.end('');
			}
			else{

			}

		});
		var post
		request.on('end', function () { // à la fin

			/*if (true) {
				var succesfullParsing = true
				bodyParsed =  {discordId:"110682291109412864",server:"s10",username:"Esronix",factionColor:6}
			}*/

			post = querystring.parse(body);
			var bodyParsed = null;
			var succesfullParsing; //boolean
			try{
				bodyParsed = JSON.parse(body);
				succesfullParsing = true;
			}
			catch (e){
				succesfullParsing = false;
			}
			logHttp("POST on"+page);
			logHttp("body : "+JSON.stringify( body));

			//TODO critical



			if (page == "/register") { // si c'est pour le register (enregistrement d'un nouevaux joueur)
				logDebug("http","POST on");

				if (succesfullParsing && bodyParsed!=undefined && bodyParsed!=null &&bodyParsed.discordId != undefined && bodyParsed.server!= undefined&& bodyParsed.username!= undefined && bodyParsed.factionColor!= undefined) {
					// si les donné eson valide
					var newUser = new UserObject(bodyParsed.discordId,bodyParsed.server,bodyParsed.username,bodyParsed.factionColor,false,false,false,false,Date.now(),true);
					/*{
						userID:bodyParsed.discordId,
						serveur:bodyParsed.server,
						username:bodyParsed.username,
						factionColor:bodyParsed.factionColor,
						isAdmin:false,
						isModo:false,
						isBan:false,
						isInGouv:false,
						dateOfRegister:Date.now()
					};*/

					arrayResult = getNewUser(newUser); // enregistre l'utilisateur

					response.writeHead(arrayResult.number, {'Content-Type': 'text/plain'});
					response.write(arrayResult.desc);
					response.end();
					/*if (arrayResult.number !=200) {
						response.writeHead(arrayResult.number, {'Content-Type': 'text/plain'});
						response.write(arrayResult.desc);
						response.end();
					}
					else{
						response.writeHead(200, {'Content-Type': 'text/plain'});
						response.write("Thanks for the data");
						response.end();
					}*/



				}
				else if(succesfullParsing){

					logHttp("data ill-formed");
					response.writeHead(400, {'Content-Type': 'text/plain'});
					response.end("Bad Request : data illformed")

				}
				else{
					logHttp("cannot parse data");
					response.writeHead(400, {'Content-Type': 'text/plain'});
					response.end("Bad Request : data illformed")
				}
			}
			else{
				logHttp("page not found");
				response.writeHead(404, {'Content-Type': 'text/plain'});
				response.end("Not found")
			}

		});


	}
	else if (request.method == "GET") { // si la methode est GET
		logHttp("GET on page "+page);
		//console.log(request.headers);
		//console.log("-------");
		var credentials = auth(request) // Basic authentification
		//console.log(credentials)

		//var regSimuData = new RegExp ("\/simulateur\\?*");
		var regSimu = new RegExp ("\\/simulateur");
		if (page == "" || page =="/") { // main page

			fs.readFile("./http-page/accueil-page.html",'utf8', function (err, data) { //
				if (err) {
					response.writeHead(404, {'Content-Type': 'text/plain'});
					response.end("Not found");
					logHttp("Not found")
				}
				else{
					logHttp("return main page")
					var dataToSend = data;

					response.writeHead(200, {'Content-Type': 'text/html'});
					response.end(dataToSend);
				}
			});


		}
		else if (page=="/log/log.txt" || page =="/data/user.json" || page =="/data/vote.json" || page=="/log/log-debug.txt" || page == "/log/log-http.txt") {




			//console.log(page)
			//					  verification sur le type             verification sur le type
			if (!sendData || !credentials || credentials.name !== loginGet[0] || credentials.pass !== loginGet[1] ) { // si les log sont faux
				if (!credentials) { // s'il n'y pa pas de login du tout
					//            page de log
					fs.readFile("./http-page/log.html",'utf8', function (err, data) { //
						if (err) {
							response.writeHead(404, {'Content-Type': 'text/plain'});
							response.end("Not found");
							logHttp("not found login page")
						}
						else{
							//remplacement de #TextPageToChange# par l'url de la page sans le / initiale
							// permet que la reqête se fait au bon endroit (sans utiliser de mutiple if pour chaque page)
							var dataToSend = data.replace("#TextPageToChange#",page.substring(1,page.length));

							response.writeHead(401, {'Content-Type': 'text/html'});
							response.end(dataToSend);
							logHttp("Unauthorized, send login page")
						}
					});
				}
				else{ // si les log sont faux
					response.writeHead(403, {'Content-Type': 'text/plain'});
					response.end("Forbidden")
					logHttp("Forbidden")
				}
			}
			else{ // si les log sont correct
				fs.readFile("."+page,'utf8', function (err, data) { // lit les login du bot
					if (err) {
						response.writeHead(404, {'Content-Type': 'text/plain'});
						response.end("Not found");
						logHttp("not found")
					}
					else{
						var dataToSend = data;
						/*while (dataToSend.search(os.EOL)!=-1){
							dataToSend = dataToSend.replace(os.EOL,"<br>");
						}*/
						response.writeHead(200, {'Content-Type': 'text/plain'});
						response.end(data);
						logHttp("send data")
					}
				});
			}

		}
		else if (page == "/admin") {
			if (!sendData || !credentials || credentials.name !== loginGet[0] || credentials.pass !== loginGet[1] ) { // si les log sont faux
				if (!credentials) {// s'il n'y pa pas de login du tout
					fs.readFile("./http-page/log.html",'utf8', function (err, data) { //
						if (err) {
							response.writeHead(404, {'Content-Type': 'text/plain'});
							response.end("Not found");
							logHttp("not found login page")
						}
						else{
							//remplacement de #TextPageToChange# par admin (url pour la requête)
							var dataToSend = data.replace("#TextPageToChange#","admin");

							response.writeHead(401, {'Content-Type': 'text/html'});
							response.end(dataToSend);
							logHttp("Unauthorized, send login page")

						}
					});
				}
				else{
					response.writeHead(403, {'Content-Type': 'text/plain'});
					response.end("Forbidden")
					logHttp("Forbidden")
				}
			}
			else{ // si les logs sont juste
				fs.readFile("./http-page/admin/page.html",'utf8', function (err, data) { // lit les login du bot
					if (err) {
						response.writeHead(404, {'Content-Type': 'text/plain'});
						response.end("Not found");
						logHttp("Not found")
					}
					else{
						var dataToSend = data;
						// rempalce #textData# par les données
						dataToSend = dataToSend.replace("#textData#",JSON.stringify(userListFaction))
						response.writeHead(200, {'Content-Type': 'text/html'});
						response.end(dataToSend);
						logHttp("send data")

					}
				});
			}
		}
		else if (page == "/admin/data") {
			// pas utiliser
			response.writeHead(404, {'Content-Type': 'text/plain'});

			response.end("Not found")
			logHttp("not found")
			/*if (!sendData || !credentials || credentials.name !== loginGet[0] || credentials.pass !== loginGet[1] ) {
				response.writeHead(403, {'Content-Type': 'text/plain'});
				response.end("Forbidden")
				logHttp("Forbidden")
			}
			else{

				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.end("WIP");
				logHttp("send Data")
			}*/
		}
		else if (page == "/simulateur/Asylamba_Project_Script.js" || page == "/simulateur/ChickenStorm.js" || page == "/simulateur/cookies_save.js" || page == "/simulateur/Html_page_text.js" || page == "/simulateur/simulateur_graphique.js" || page == "/simulateur/simulation_asylamba.js"|| page == "/simulateur/url_related_usage.js") {
			fs.readFile("."+page,'utf8', function (err, data) { // lit les login du bot
				if (err) {
					response.writeHead(404, {'Content-Type': 'text/plain'});
					response.end("Not found");
					logHttp("Not found")
				}
				else{
					var dataToSend = data;
					// rempalce #textData# par les données
					dataToSend = data;
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.end(dataToSend);
					logHttp("send data")

				}
			});
		}
		else if (page == "/simulateur") {
			console.log(page)
			fs.readFile("./simulateur/Asylamba_project_bot_launcher.html",'utf8', function (err, data) { // lit les login du bot
				if (err) {
					response.writeHead(404, {'Content-Type': 'text/plain'});
					response.end("Not found");
					logHttp("Not found")
				}
				else{
					var dataToSend = data;
					// rempalce #textData# par les données
					dataToSend = data;
					response.writeHead(200, {'Content-Type': 'text/html'});
					response.end(dataToSend);
					logHttp("send data")

				}
			});
		}
		else{
			response.writeHead(404, {'Content-Type': 'text/plain'});

			response.end("Not found")
			logHttp("not found")
		}
	//});

    }
    else{
	response.writeHead(404, {'Content-Type': 'text/plain'});

	response.end("Bad Request")
	logHttp("Bad Request ("+request.method+")");


  }
});

function getNewUser(data){
	/*
	 * gère les utilisateurs
	 * les donné de l'utilisateur sont dans data
	 * exécute l'enregistremment et donne le / les rôles approprier
	 *
	 */

	logDebug("user","getNewUser : "+ JSON.stringify(data));

	var usernameAlreadyIn = false; // si le username d'asylmaba est dedans déjà
	var userIdAlreadyIn = false; // si l'id de l'utilisateur est déjà enregistrer dans le bot
	var userInDiscordServeur=false; // si l'utilisateur est dans le serv discord
	var posUser =0; // pos de l'user dans le bot
	// array des id qui ont lemême username d'aslymba
	var arrayUserSameUserName=[];//=[data.userID];

	for (var i in userListFaction){ // check au travet de la list
		if (data.username == userListFaction[i].username) {
			usernameAlreadyIn = true;
			arrayUserSameUserName.push(userListFaction[i].userID);
		}
		if (data.userID == userListFaction[i].userID) {
			userIdAlreadyIn = true;
			posUser = i;
		}
	}

	for (var i in bot["servers"][discordServeurId]["members"]){ // regarde au travert de la list des membre du serveur
		if (i == data.userID) {
			userInDiscordServeur = true;
		}
	}

	logDebug("user","userIdAlreadyIn : "+userIdAlreadyIn+"; usernameAlreadyIn : "+usernameAlreadyIn);
	var returnArray;
	if (data.serveur == "s14" || data.serveur == "s18") { // si c'est le bon serveur (on peux pas se log depuis la preprod)

		if (usernameAlreadyIn && data.username!= null) { // si un suername est utliser deux fois et que ce n'est pas null

			var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // date avec un bon format text
			if (arrayUserSameUserName.length>1) { // si c'est pour plus d'unutilisateur


				log("send message","["+dateString+"] [Warning] [role] le même nom pseudo ingame ("+data.username+") a été utilisé pour <@"+arrayUserSameUserName.join("> <@")+"> la tentative n'a cependant pas été bloquée");


				// log des message de warning dans le salon #bot-log
				botSendMessage([channel.botLogChannelId,"["+dateString+"] [Warning] [role] le même nom pseudo ingame ("+data.username+") a été utilisé pour <@"+arrayUserSameUserName.join("> <@")+"> la tentative n'a cependant pas été bloquée"])

			}
			else{
				log("send message","["+dateString+"] [Warning] [role] un joueur s'est authentifié 2 fois ou plus ("+data.username+") <@"+arrayUserSameUserName.join("> <@")+">");

				botSendMessage([channel.botLogChannelId,"["+dateString+"] [Warning] [role] un joueur s'est authentifié 2 fois ou plus ("+data.username+") <@"+arrayUserSameUserName.join("> <@")+">"]);
				// log des message de warning dans le salon #bot-log

			}
		}

		if (!userIdAlreadyIn) { // si l'utilisateur n'est pas encore enregistrer

			log("new user",JSON.stringify(data));

			if (true /*data.factionColor==1 || data.factionColor==2 || data.factionColor==6 || data.factionColor==7 || data.factionColor==11 || data.factionColor==9 || data.factionColor==4 || data.factionColor==8*/ ) { // si on a les bonne couleur de faction (TODO faire une fonction)



				data.pendingRole.push({roleId:role.getRoleIdByFactionColorFactionServer(data.factionColor),serverId:servers.getServerIdFromFactionColor(data.factionColor)}); // TODO
				userListFaction.push(data); // ajoute l'utilisateur
				posTemp = userListFaction.length-1;
				bot.createInvite({
						channel: servers.getServerIdFromFactionColor(data.factionColor),
						max_users: 300, //Optional
						//max_age: 1200, //Optional 1Jour
						// TODO remettre correctemnt après que bug role résolu
						temporary: true, //Optional
						xkcdpass: false //Optional
					 },function(error, response){
						if (error == undefined) {

							// TODO  more reliable methode
							botSendMessageBis(userListFaction[postemp].userID,"Voici votre lien d'invitation pour le server de votre faction Asylamba "+invitationPrefix+"/"+response.code)
						}
					 }
				);

				returnArray ={number:200,desc:"user register correctly"};

				if (userInDiscordServeur) {
					// ajoute l'utilisateur à verifié
					botAddToRole([discordServeurId,data.userID,role.verified.id]);

					logDebug("role","add user to verifie");

					pendingOperation.addOpperation(function(args){
						var discordServeurId = args[1];
						var data = args[0]
						var roleToAdd = role.getRoleIdByFactionColor(data.factionColor);
						if (roleToAdd.id == undefined) { // si la couleur de faction n'est pas correct
							logDebug("Warning","[role] add user to nothing (this may be an error)");
						}
						else{
							// ajoute l'user
							bot.addToRole({
								server: discordServeurId,
								user: data.userID,
								role: roleToAdd.id
							});
						}
					},[data,discordServeurId])
				}
				else{


					//botSendMessageBis(userListFaction[userListFaction.length-1].userID,)

					bot.createInvite({
						channel: discordServeurId,
						max_users: 30, //Optional
						max_age: 1200, //Optional 1Jour
						temporary: true, //Optional
						xkcdpass: false //Optional
					 },function(error, response){
						if (error == undefined) {
							// TODO  more reliable methode
							botSendMessageBis(userListFaction[posTemp].userID,"Voici votre lien d'invitation pour le server discord générale d'Asylamba "+invitationPrefix+"/"+response.code)
						}
						else{
							console.log(error);
						}
					 }
					 );


					userListFaction[userListFaction.length-1].pendingRole.push({roleId:role.verified.id,serverId:discordServeurId});
					userListFaction[userListFaction.length-1].pendingRole.push({roleId:role.getRoleIdByFactionColor(data.factionColor).id,serverId:discordServeurId});
				}



			}
			else{
				logDebug("user","wrong faction");
				returnArray ={number:200,desc:"Wrong factionColor"};
			}


		}
		else if (userIdAlreadyIn) { // si l'user est déjà dedans

			log("userIdAlreadyIn",JSON.stringify(data));

			returnArray ={number:200,desc:"user register correctly (update Status)"};
			if ( isBanFunc(userListFaction[posUser].userID)) {
				log("role","user try to get new role but he his banned")
				if (data.username != userListFaction[posUser].username) {// si l'username est différent
					log("Register user change","user id "+userListFaction[posUser].userID+" change username form "+userListFaction[posUser].username+" to "+data.username);
					userListFaction[posUser].username = data.username; // update l'username
				}
			}
			else{

				botAddToRoleBis(discordServeurId,data.userID,role.verified.id);
				/*bot.addToRole({ // ajoute l'utilisateur à verifier
					server: discordServeurId,
					user: data.userID,
					role: role.verified.id
				});*/
				logDebug("role","add user to verifie");
				if (data.username != userListFaction[posUser].username) {// si l'username est différent
					log("Register user change","user id "+userListFaction[posUser].userID+" change username form "+userListFaction[posUser].username+" to "+data.username);
					userListFaction[posUser].username = data.username; // update l'username
				}
				// si la couleur de facrion est différente et qu'elle n'est pas undefined au départ
				// => l'utilisateur essaye de changer de faction => on bloque
				if ( userListFaction[posUser].factionColor!=undefined && userListFaction[posUser].factionColor!=null && userListFaction[posUser].factionColor!=0 && data.factionColor!=userListFaction[posUser].factionColor ) {

					var supMessage = ""; // liste des @admin

					if (userListFaction != undefined) {
						for(var i in userListFaction){
							if ( userListFaction[i].isAdmin) {
								supMessage +="<@"+userListFaction[i].userID+"> ";
							}
						}
					}


					var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
					// envoi un message dans #bot-log
					var mToSend = "["+dateString+"] [Warning] [role] un utilisateur a essayé de changer de faction : <@"+data.userID+"> de la faction " +userListFaction[posUser].factionColor+" à la faction "+data.factionColor +"\n "+supMessage;
					botSendMessageBis(channel.botLogChannelId,mToSend)



					returnArray ={number:200,desc:"disord user already register"};
					log("send message","["+dateString+"] [Warning] [role] un utilisateur a essayé de changer de faction : <@"+data.userID+"> de la faction " +userListFaction[posUser].factionColor+" à la faction "+data.factionColor + "\n " + supMessage);


				}
				else if(data.factionColor!=userListFaction[posUser].factionColor){
					// si la faction passe de undefined à un numéro correct

					//userListFaction[posUser].factionColor = data.factionColor;
					log("userIdAlreadyIn",JSON.stringify(data));

					log("Register user change","user id "+userListFaction[posUser].userID+" change faction form "+userListFaction[posUser].factionColor+" to "+data.factionColor);


					pendingOperation.addOpperation(function(data){
						var roleToAdd = role.getRoleIdByFactionColor(data.factionColor);
						if (roleToAdd.id == undefined) {
							logDebug("Warning","[role] add user to nothing (this may be an error)");
						}
						else{
							bot.addToRole({
								server: discordServeurId,
								user: data.userID,
								role: roleToAdd.id
							});
						}
					},data)


					pendingOperation.addOpperation(function(data){
						var roleToAdd = role.getRoleIdByFactionColor(fColor);
						if (roleToAdd.id == undefined) {
							logDebug("Warning","[role] remove user from nothing (this may be an error)");
						}
						else{
							bot.removeFromRole({
								server: discordServeurId,
								user: data.userID,
								role: roleToAdd.id
							});
						}
					},data)
					if (userListFaction[posUser].pendingRole == undefined) {
						userListFaction[posUser].pendingRole =[];
					}

					posTemp = posUser;

					bot.createInvite({
						channel: servers.getServerIdFromFactionColor(data.factionColor),
						max_users: 30, //Optional
						max_age: 1200, //Optional 1Jour
						temporary: true, //Optional
						xkcdpass: false //Optional
					 },function(error, response){
						if (error == undefined) {
							console.log(posTemp);
							// TODO  more reliable methode
							botSendMessageBis(userListFaction[posTemp].userID,"Voici votre lien d'invitation pour le server de votre faction Asylamba "+invitationPrefix+"/"+response.code)
						}
						else{
							console.log(error);
						}
					 }
				);

					userListFaction[posUser].pendingRole.push({roleId:role.getRoleIdByFactionColorFactionServer(data.factionColor),serverId:servers.getServerIdFromFactionColor(data.factionColor)}); // TODO

					userListFaction[posUser].factionColor = data.factionColor; // upadte dans la list
					returnArray ={number:200,desc:"user register correctly (update Status)"};
				}
				else{
					logDebug("error","[user] [role] user didin't pass any test ? (at ligne "+__line+" bot.js)");
				}
				//
			}
		}
		else if (!userInDiscordServeur) {
			logDebug("user","user not in server Aslymaba 2.0 ");
			returnArray ={number:200,desc:"userID not found in Aslymaba 2.0 server"};
		}
		/*else if(usernameAlreadyIn){
			// que faire ?
			// TODO décider
			returnArray ={number:409,desc:"Conflict : username already register"};
		}*/
		else{
			logDebug("error","[user] [role] didin't pass any test ? => 500 : Internal Server Error(at ligne "+__line+" bot.js)");
			returnArray ={number:500,desc:"Internal Server Error"};
		}





		/***********************************************************/





	}
	else if (data.serveur == "s9") {

	}// désactivé
	else if (false && data.serveur == "s9") { // si c'est le bon serveur (on peux pas se log depuis la preprod)

		if (usernameAlreadyIn && data.username!= null) { // si un suername est utliser deux fois et que ce n'est pas null

			var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); // date avec un bon format text
			if (arrayUserSameUserName.length>1) { // si c'est pour plus d'unutilisateur


				log("send message","["+dateString+"] [Warning] [role] le même nom pseudo ingame ("+data.username+") a été utilisé pour <@"+arrayUserSameUserName.join("> <@")+"> la tentative n'a cependant pas été bloquée");


				// log des message de warning dans le salon #bot-log
				botSendMessage([channel.botLogChannelId,"["+dateString+"] [Warning] [role] le même nom pseudo ingame ("+data.username+") a été utilisé pour <@"+arrayUserSameUserName.join("> <@")+"> la tentative n'a cependant pas été bloquée"])
				/*bot.sendMessage({
					to: channel.botLogChannelId,
					message: "["+dateString+"] [Warning] [role] le même nom pseudo ingame ("+data.username+") a été utilisé pour <@"+arrayUserSameUserName.join("> <@")+"> la tentative n'a cependant pas été bloquée"
				});*/
			}
			else{
				log("send message","["+dateString+"] [Warning] [role] un joueur s'est authentifié 2 fois ou plus ("+data.username+") <@"+arrayUserSameUserName.join("> <@")+">");

				botSendMessage([channel.botLogChannelId,"["+dateString+"] [Warning] [role] un joueur s'est authentifié 2 fois ou plus ("+data.username+") <@"+arrayUserSameUserName.join("> <@")+">"]);
				// log des message de warning dans le salon #bot-log
				/*bot.sendMessage({
					to: channel.botLogChannelId,
					message:"["+dateString+"] [Warning] [role] un joueur s'est authentifié 2 fois ou plus ("+data.username+") <@"+arrayUserSameUserName.join("> <@")+">"
				});*/
			}
		}

		if (!userIdAlreadyIn && userInDiscordServeur) { // si l'utilisateur n'est pas encore enregistrer mais qu'il est sur le serveur

			log("new user",JSON.stringify(data));

			if (true/*data.factionColor==1 || data.factionColor==8 || data.factionColor==11*/) { // si on a les bonne couleur de faction (TODO faire une fonction)
				userListFaction.push(data); // ajoute l'utilisateur
				//fs.writeFile("./data/user.json",JSON.stringify(userListFaction),function (err) {}); // écrit dans le fichier de stoquage

				returnArray ={number:200,desc:"user register correctly"};

				// ajoute l'utilisateur à verifié
				botAddToRole([discordServeurId,data.userID,role.verified.id]);
				/*bot.addToRole({
					server: discordServeurId,
					user: data.userID,
					role: role.verified.id // TODO variable
				});*/

				logDebug("role","add user to verifie");
				// timout pour des raison d'API qui ne vas ajouté qu'à un seul role si les demandes sont trop proches

				pendingOperation.addOpperation(function(args){
					var discordServeurId = args[1];
					var data = args[0]
					var roleToAdd = role.getRoleIdByFactionColor(data.factionColor);
					if (roleToAdd.id == undefined) { // si la couleur de faction n'est pas correct
						logDebug("Warning","[role] add user to nothing (this may be an error)");
					}
					else{
						// ajoute l'user
						bot.addToRole({
							server: discordServeurId,
							user: data.userID,
							role: roleToAdd.id
						});
					}
				},[data,discordServeurId])

				//setTimeout(function(data){
				//	/*if (data.factionColor==1) {
				//
				//		bot.addToRole({
				//			server: discordServeurId,
				//			user: data.userID,
				//			role: "133951475813449728"
				//		});
				//		logDebug("role","add user to Empire");
				//	}
				//	else if (data.factionColor==8) {
				//
				//		bot.addToRole({
				//			server: discordServeurId,
				//			user: data.userID,
				//			role: "133975813199495168"
				//		});
				//		logDebug("role","add user to Ligue");
				//
				//	}
				//	else if (data.factionColor==11) {
				//
				//		bot.addToRole({
				//			server: discordServeurId,
				//			user: data.userID,
				//			role: "133976248199151616"
				//		});
				//		logDebug("role","add user to Neo");
				//	}
				//	else{
				//		logDebug("Warning","[role] add user to nothing (this may be an error)");
				//	}*/
				//
				//	// récupère le rôle approrier
				//	var roleToAdd = role.getRoleIdByFactionColor(data.factionColor);
				//	if (roleToAdd.id == undefined) { // si la couleur de faction n'est pas correct
				//		logDebug("Warning","[role] add user to nothing (this may be an error)");
				//	}
				//	else{
				//		// ajoute l'user
				//		bot.addToRole({
				//			server: discordServeurId,
				//			user: data.userID,
				//			role: roleToAdd.id
				//		});
				//	}
				//},1000,data);

			}
			else{
				logDebug("user","wrong faction");
				returnArray ={number:200,desc:"Wrong factionColor"};
			}


		}
		else if (userIdAlreadyIn) { // si l'user est déjà dedans

			log("userIdAlreadyIn",JSON.stringify(data));

			returnArray ={number:200,desc:"user register correctly (update Status)"};
			if ( isBanFunc(userListFaction[posUser].userID)) {
				log("role","user try to get new role but he his banned")
				if (data.username != userListFaction[posUser].username) {// si l'username est différent
					log("Register user change","user id "+userListFaction[posUser].userID+" change username form "+userListFaction[posUser].username+" to "+data.username);
					userListFaction[posUser].username = data.username; // update l'username
				}
			}
			else{

				botAddToRoleBis(discordServeurId,data.userID,role.verified.id);
				/*bot.addToRole({ // ajoute l'utilisateur à verifier
					server: discordServeurId,
					user: data.userID,
					role: role.verified.id
				});*/
				logDebug("role","add user to verifie");
				if (data.username != userListFaction[posUser].username) {// si l'username est différent
					log("Register user change","user id "+userListFaction[posUser].userID+" change username form "+userListFaction[posUser].username+" to "+data.username);
					userListFaction[posUser].username = data.username; // update l'username
				}
				// si la couleur de facrion est différente et qu'elle n'est pas undefined au départ
				// => l'utilisateur essaye de changer de faction => on bloque
				if ( userListFaction[posUser].factionColor!=undefined && userListFaction[posUser].factionColor!=null && userListFaction[posUser].factionColor!=0 && data.factionColor!=userListFaction[posUser].factionColor ) {
					//log("Register user change","user id "+userListFaction[posUser].userID+" change faction form "+userListFaction[posUser].factionColor+" to "+data.factionColor);



					/*setTimeout(function(data){
						if (data.factionColor==1) {

							bot.addToRole({
								server: discordServeurId,
								user: data.userID,
								role: "133951475813449728"
							});
						}
						else if (data.factionColor==8) {

							bot.addToRole({
								server: discordServeurId,
								user: data.userID,
								role: "133975813199495168"
							});

						}
						else if (data.factionColor==11) {

							bot.addToRole({
								server: discordServeurId,
								user: data.userID,
								role: "133976248199151616"
							});

						}
						},2000,data);
					setTimeout(function(fColor){
						if (fColor==1) {

							bot.removeFromRole({
								server: discordServeurId,
								user: data.userID,
								role: "133951475813449728"
							});
						}
						else if (fColor==8) {

							bot.removeFromRole({
								server: discordServeurId,
								user: data.userID,
								role: "133975813199495168"
							});

						}
						else if (fColor==11) {

							bot.removeFromRole({
								server: discordServeurId,
								user: data.userID,
								role: "133976248199151616"
							});

						}
					},1000,userListFaction[posUser].factionColor);
					*/

					var supMessage = ""; // liste des @admin

					if (userListFaction != undefined) {
						for(var i in userListFaction){
							if ( userListFaction[i].isAdmin) {
								supMessage +="<@"+userListFaction[i].userID+"> ";
							}
						}
					}


					var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
					// envoi un message dans #bot-log
					var mToSend = "["+dateString+"] [Warning] [role] un utilisateur a essayé de changer de faction : <@"+data.userID+"> de la faction " +userListFaction[posUser].factionColor+" à la faction "+data.factionColor +"\n "+supMessage;
					botSendMessageBis(channel.botLogChannelId,mToSend)

					/*bot.sendMessage({
						to: channel.botLogChannelId,
						message: mToSend
					});*/

					returnArray ={number:200,desc:"disord user already register"};
					log("send message","["+dateString+"] [Warning] [role] un utilisateur a essayé de changer de faction : <@"+data.userID+"> de la faction " +userListFaction[posUser].factionColor+" à la faction "+data.factionColor + "\n " + supMessage);


				}
				else if(data.factionColor!=userListFaction[posUser].factionColor){
					// si la faction passe de undefined à un numéro correct

					//userListFaction[posUser].factionColor = data.factionColor;
					log("userIdAlreadyIn",JSON.stringify(data));

					log("Register user change","user id "+userListFaction[posUser].userID+" change faction form "+userListFaction[posUser].factionColor+" to "+data.factionColor);
					// timout pour des raison d'API qui ne vas ajouté qu'à un seul role si les demandes sont trop proches
					//setTimeout(function(data){
					//	/*
					//	 * ajoute l'utilisateur à la bonne faction
					//	 */
					//	/*if (data.factionColor==1) {
					//
					//		bot.addToRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: "133951475813449728"
					//		});
					//		logDebug("role","add user to empire");
					//	}
					//	else if (data.factionColor==8) {
					//
					//		bot.addToRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: "133975813199495168"
					//		});
					//		logDebug("role","add user to Ligue");
					//
					//	}
					//	else if (data.factionColor==11) {
					//
					//		bot.addToRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: "133976248199151616"
					//		});
					//
					//		logDebug("role","add user to Neo");
					//
					//	}
					//	else{
					//		logDebug("Warning","[role] add user to nothing (this may be an error)");
					//	}*/
					//	var roleToAdd = role.getRoleIdByFactionColor(data.factionColor);
					//	if (roleToAdd.id == undefined) {
					//		logDebug("Warning","[role] add user to nothing (this may be an error)");
					//	}
					//	else{
					//		bot.addToRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: roleToAdd.id
					//		});
					//	}
					//},2000,data);

					pendingOperation.addOpperation(function(data){
						var roleToAdd = role.getRoleIdByFactionColor(data.factionColor);
						if (roleToAdd.id == undefined) {
							logDebug("Warning","[role] add user to nothing (this may be an error)");
						}
						else{
							bot.addToRole({
								server: discordServeurId,
								user: data.userID,
								role: roleToAdd.id
							});
						}
					},data)

					// timout pour des raison d'API qui ne vas ajouté qu'à un seul role si les demandes sont trop proches
					//setTimeout(function(fColor){
					//
					//	/*
					//	 * enlève l'utilisateur de sa faction précédente (raison de sécurité)
					//	 */
					//
					//
					//	/*if (fColor==1) {
					//
					//		bot.removeFromRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: "133951475813449728"
					//		});
					//		logDebug("role","remove user from Empire");
					//	}
					//	else if (fColor==8) {
					//
					//		bot.removeFromRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: "133975813199495168"
					//		});
					//		logDebug("role","remove user from Ligue");
					//	}
					//	else if (fColor==11) {
					//
					//		bot.removeFromRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: "133976248199151616"
					//		});
					//
					//		logDebug("role","remove user from Neo");
					//
					//	}
					//	else{
					//		logDebug("Warning","[role] remove user from nothing (this may be an error)");
					//	}*/
					//	var roleToAdd = role.getRoleIdByFactionColor(fColor);
					//	if (roleToAdd.id == undefined) {
					//		logDebug("Warning","[role] remove user from nothing (this may be an error)");
					//	}
					//	else{
					//		bot.removeFromRole({
					//			server: discordServeurId,
					//			user: data.userID,
					//			role: roleToAdd.id
					//		});
					//	}
					//},1000,(userListFaction[posUser].factionColor));

					pendingOperation.addOpperation(function(data){
						var roleToAdd = role.getRoleIdByFactionColor(fColor);
						if (roleToAdd.id == undefined) {
							logDebug("Warning","[role] remove user from nothing (this may be an error)");
						}
						else{
							bot.removeFromRole({
								server: discordServeurId,
								user: data.userID,
								role: roleToAdd.id
							});
						}
					},data)

					userListFaction[posUser].factionColor = data.factionColor; // upadte dans la list
					returnArray ={number:200,desc:"user register correctly (update Status)"};
				}
				else{
					logDebug("error","[user] [role] user didin't pass any test ? (at ligne "+__line+" bot.js)");
				}
				//
			}
		}
		else if (!userInDiscordServeur) {
			logDebug("user","user not in server Aslymaba 2.0 ");
			returnArray ={number:200,desc:"userID not found in Aslymaba 2.0 server"};
		}
		/*else if(usernameAlreadyIn){
			// que faire ?
			// TODO décider
			returnArray ={number:409,desc:"Conflict : username already register"};
		}*/
		else{
			logDebug("error","[user] [role] didin't pass any test ? => 500 : Internal Server Error(at ligne "+__line+" bot.js)");
			returnArray ={number:500,desc:"Internal Server Error"};
		}
	}
	else{
		logDebug("user","wrong serveur");
		returnArray ={number:200,desc:"wrong server"};
	}

	fs.writeFile("./data/user.json",JSON.stringify(userListFaction),function (err) {}); // écrit dans le fichier de stoquage

	return returnArray;

}

server.listen(8080);

/*server.on("request",function (request, response) {
    if (request.method == 'POST') {
        var body = '';
	request.setEncoding('utf8');
        request.on('data', function (data) {
            body += data;

	console.log(data)

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
		response.writeHead(413, 'Request Entity Too Large', {'Content-Type': 'text/plain'});
		response.end('');
        });
	var post
        request.on('end', function () {
		post = querystring.parse(body);
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.write('Thanks for the data');
		response.end();
		console.log("test")
        });
	console.log(request.headers);
	console.log(post)

    }
})*/


/***************************************************************************************************************************************************************/
/***************************************************************************************************************************************************************/




function log(head,message){ // log a message in a texte file (./log/log.txt)
	var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	//				      replace T with a space     delete the dot and everything after

	var stringHeadExtend = "";
	if (head!= undefined &&  head!=""  && head!= null ) {
		stringHeadExtend ="["+head+"] ";
	}

	fs.appendFile('./log/log.txt', "["+dateString+"] "+stringHeadExtend+message+os.EOL, function (err) {
		if (err){
			throw err;
		}
	});

	logDebug(head,message);
}

function logDebug(head,message){ // log a debug message if the bot is in debug
	if (debug) {


		var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		//				      replace T with a space     delete the dot and everything after

		var stringHeadExtend = "";
		if (head!= undefined &&  head!=""  && head!= null ) {
			stringHeadExtend ="["+head+"] ";
		}

		fs.appendFile('./log/log-debug.txt', "["+dateString+"] "+stringHeadExtend+message+os.EOL, function (err) {
			if (err){
				throw err;
			}
		});
	}
}

function logHttp(message){ // log an message for http protocol
	var dateString = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	//				      replace T with a space     delete the dot and everything after

	var stringHeadExtend = "";

	stringHeadExtend ="["+"http"+"] ";


	fs.appendFile('./log/log-http.txt', "["+dateString+"] "+stringHeadExtend+message+os.EOL, function (err) {
		if (err){
			throw err;
		}
	});

	logDebug("http",message);
}

/***************************************************************************************************************************************************************/

var timeUserUpdate = 48 // 48*15 minutes = 1/2 jour environ
// 48*16.667 = 13.6 hours
var userUpdateCurrent = 0 // counter for update when it is equal (or greater) to timeUserUpdate => update user list
// increment by one each statusRefreshInterval milisecondes

function updateUserSlow(){ // update suer counter function
	++userUpdateCurrent;
	if (userUpdateCurrent>=timeUserUpdate) {
		updateUserStatus();
		userUpdateCurrent=0;
	}
}

function updateUserStatus() { // met a jour la liste des utilisateurs
	log("User List Update","User List Update begin");
	for (var i in bot["servers"][discordServeurId]["members"]){// note : i is an user discord ID

		// variable fpour l'etat de l'utilisateurs
		var admin =false;
		var modo = false;
		var factionColor = 0;
		var isVerifed = false;
		var isInGouv = false
		var verified = false

		var userI = bot["servers"][discordServeurId]["members"][i] // one member in discord

		for (var j in userI["roles"]){ // loop au travert les rôles
			//console.log(userI["roles"][j])
			if (userI["roles"][j] == role.adminRoleId.id) {
				admin = true;
				modo= true;
				isVerifed = true;
			}
			if (userI["roles"][j] == role.modoRoleId.id) {
				modo= true;
				isVerifed = true;
			}
			if (userI["roles"][j] == role.verified.id) {
				isVerifed = true;
			}
			var fColor=role.getFactionColorByRoleId(userI["roles"][j]);
			if ( fColor!= 0) {
				factionColor = fColor;
			}
			// as there is more than one gouv rôle and the player may be in only one of them the isInGouv check is require
			isInGouv = (isInGouv || role.isGouveRole(userI["roles"][j]));

		}


		/*for(var k in userList.users){
			if (i ==userList.users[k].userID ) {

			}
		}*/
		var isInList = false; // is already in list of user in the bot
		var posUser=null; // position of the player in the list if he/she/it is
		if (userListFaction != undefined) {
			for(var k in userListFaction){
				if (i ==userListFaction[k].userID ) { // i is an user discord ID
					isInList = true;
					posUser = k;
				}
			}
		}

		var modif = false; // if the user data is modified
		if (isInList) {
			var logMessage = " set user (id:"+userListFaction[posUser].userID+") :"; // a message for the log
			if (userListFaction[posUser].isAdmin != admin) {
				logMessage += "status Admin : "+admin.toString()+" from "+userListFaction[posUser].admin+";"
				modif = true;
				userListFaction[posUser].isAdmin = admin
			}
			if (userListFaction[posUser].isModo != modo) {
				logMessage += "status Modo : "+modo.toString()+" from "+userListFaction[posUser].modo+";"
				modif = true;
				userListFaction[posUser].isModo = modo
			}
			if (userListFaction[posUser].factionColor != factionColor) {
				logMessage += "status factionColor : "+factionColor.toString()+" from "+userListFaction[posUser].factionColor+";"
				modif = true;
				userListFaction[posUser].factionColor = factionColor
			}
			if (userListFaction[posUser].isVerifed != isVerifed) {
				logMessage += "status isVerifed : "+isVerifed.toString()+" from "+userListFaction[posUser].isVerifed+";"
				modif = true;
				userListFaction[posUser].isVerifed = isVerifed;
			}
			if (userListFaction[posUser].isInGouv!=isInGouv) {
				logMessage += "status isInGouv : "+isInGouv.toString()+" from "+userListFaction[posUser].isInGouv+";"
				modif = true;
				userListFaction[posUser].isInGouv=isInGouv;
			}
			if (modif) {// if mofi then log the message
				log("User List Update",logMessage);
				console.log(logMessage)
			}
		}
		else{ // if the user is not in the internal list
			var newUser = new UserObject(i,null,null,factionColor,admin,modo,false,isInGouv,Date.now());
			userListFaction.push(newUser);

			var logMessage = "adding new user "+JSON.stringify(newUser)
			log("User List Update",logMessage);
			console.log(logMessage)

		}
	}
	fs.writeFile("./data/user.json",JSON.stringify(userListFaction),function (err) {}); // set the list in the proper file
	log("User List Update","User List Update end");
}

/***************************************************************************************************************************************************************/



//voteArray
//			roleListeP : entrée simplifié (commençant à 0) ce référant au rôle correspondant dans roleListId
function VoteObject(idP,roleListP,userIDP,responceListP,q){
	this.id = idP; // id of the vote : need to find it
	this.roleList = []; // list able to vote
	// vérification pour voire si la liste des rôle est vide
	this.reponceCollection = []; // count of the vote
	if (roleListP.length ==0) {
		throw "roleListP incorect dans voteObject"
	}
	if (responceListP.length ==0) {
		throw "responceListP incorect dans voteObject"
	}
	for (var i in roleListP){ // ste the propser role id
		this.roleList.push(roleListId[parseInt(roleListP[i])]);
	}
	this.ownerId = userIDP; // who creat the vote
	this.isClosed = false; // if the vote is closed
	this.responceList =[];
	for (var i in responceListP){
		this.reponceCollection.push(0); // when created nobody responce => all responce at 0
		this.responceList.push(responceListP[i].trim()); // trim the responce
	}

	this.resultsText = function(){
		//TODO
		// => use an other function
		// textResultVote
	}
	this.question =q.trim();
	this.userResp = new Array(); // liste des id qui ont répondu


}

var getVoteMessage = function(votePara,userID){ // send the info of the vote message
	/* form of the returned message
	 *
	 * vote : this is a question?
	 * 1) yes
	 * 2) probably
	 * 3) no
	 *
	 */
	if (canAccesVote(votePara,userID)) { // TODO
		var m = "vote : "+votePara.question;

		for (var i in votePara.responceList){ // list of responce
			m+= "\n"+(parseInt(i)+1).toString()+") "+votePara.responceList[i];
		}
		return m;
	}
	else{
		return "Vous n'avez pas accès à ce vote";
	}
}
//			vote obect    discord user id
var canAccesVote = function(votePara,userID){ // determine if the player (userID) can accesse the vote (votePara)

	if (userID == votePara.ownerId) { // if the player own the vot he/she/it can always accest it
		return true;
	}
	else{
		var returnVal = false
		for (var i in bot["servers"][discordServeurId]["members"]){
			if (i == userID) { // look for the correct member
				if (bot["servers"][discordServeurId]["members"][i]["roles"].length == 0) { // if the user has not any role then he can voze only if the vote is for everyone


					for (var k in votePara.roleList){
						if (votePara.roleList[k] == role.evryoneRole.id) {
							returnVal = true;
						}
					}
				}
				else{
					for (var j in bot["servers"][discordServeurId]["members"][i]["roles"]){

						//console.log(bot["servers"][discordServeurId]["members"][i]["roles"][j]);

						for (var k in votePara.roleList){
							//console.log("k:"+votePara.roleList[k]);

							// if the user is in the correct role or the vote role is everyone
							if (bot["servers"][discordServeurId]["members"][i]["roles"][j] == votePara.roleList[k] || votePara.roleList[k] == role.evryoneRole.id) {
								returnVal = true;
							}
						}

					}
				}
			}
		}
		return returnVal;

	}


}


var errorReportVote = function(channelID,additionalError){ // send (in discord) a basic error message for the vote
	if (additionalError == undefined || additionalError=="" || additionalError==null) {
		botSendMessageBis(channelID,"commande mal formée entrer \"!vote help\" pour voir l'aide");
		/*
		bot.sendMessage({
			to: channelID,
			message: "commande mal formée entrer \"!vote help\" pour voir l'aide"
		});*/
	}
	else{
		botSendMessageBis(channelID,"erreur : "+additionalError+"\n"+"entrer \"!vote help\" pour voir l'aide");
		//bot.sendMessage({
		//	to: channelID,
		//	message: "erreur : "+additionalError+"\n"+"entrer \"!vote help\" pour voir l'aide"
		//});
	}

}

var textResultVote = function (votePara,userID) {
	if (canAccesVote(votePara,userID)) {
		if (true) { // // changé ça en if vote.isColsed à voire
			var m = "vote : "+votePara.question;
			var sum =0;
			for (var i in votePara.reponceCollection){
				sum += votePara.reponceCollection[i]
			}


			if (sum != 0) {
				for (var i in votePara.responceList){
					m+= "\n"+(parseInt(i)+1).toString()+") "+votePara.responceList[i] + " == " +  votePara.reponceCollection[i] +" / " + sum +" ("+Math.round(votePara.reponceCollection[i]/sum*100)+"%)"
				}

			}
			else{
				for (var i in votePara.responceList){
					m+= "\n"+(parseInt(i)+1).toString()+") "+votePara.responceList[i] + " == " +  votePara.reponceCollection[i] +" / " + sum +" (0%)"

				}
			}

			return m

		}
		else{
			return "le vote est encore ouvert, vous ne pouvez donc pas voir les résultats"
		}
	}
	else{
		return "Vous n'avez pas accès à ce vote"
	}
}

//syntaxe : !vote creat q1 texte;(0,3,6);(ceci est un texte,r2)

function voteFunctionManager(user, userID, channelID, message, rawEvent){
	//messageArray = []
	var messageArray =[]

	if (message.search(" " !=-1)) {
		messageArray= message.split(" ");
	}

	if (messageArray.length ==0) {
		errorReportVote();
	}
	else{
		//var messagePostVote = message.split(" ").shift();
		//messagePostVote = messagePostVote.join(" ");
		if (messageArray[1] =="help") {
			botSendMessageBis(channelID,"aide partiellement disponible https://dl.dropboxusercontent.com/u/110049848/asylamba/bot/user%20manual.pdf");
			/*bot.sendMessage({
				to: channelID,
				message: "aide partiellement disponible https://dl.dropboxusercontent.com/u/110049848/asylamba/bot/user%20manual.pdf"//TODO écrire l'aide
			});*/
		}
		else if (messageArray[1] == "create") { // creat
			var messageUsefull = message.split(" ");
			messageUsefull.shift()
			messageUsefull.shift()
			messageUsefull = messageUsefull.join(" ");

			var messageUsefullArray=[];

			if (messageUsefull.search(";")!=-1) {
				messageUsefullArray = messageUsefull.split(";");
			}


			if (messageUsefullArray.length >= 3) {
				var roleVoteList = messageUsefullArray[1];
				//if (roleVoteList.search("(")!=-1) {
					roleVoteList = roleVoteList.replace("(","");
				//}
				//if (roleVoteList.search("(")!=-1 ) {
					roleVoteList = roleVoteList.replace(")","");
				//}

				while(roleVoteList.search(/[^0-9,]+/)!= -1 ){ // TODO enlever les caractères qui ne sont pas , [0-9,]
					roleVoteList = roleVoteList.replace(/[^0-9,]+/,"");
				}

				var roleVoteListArray = roleVoteList.split(",");
				var isValideRoleList = true;
				for (var i in roleVoteListArray){
					if (isNaN(parseInt(roleVoteListArray[i])) && parseInt(roleVoteListArray[i])==parseFloat(roleVoteListArray[i]) &&  parseInt(roleVoteListArray[i])>=0 &&  parseInt(roleVoteListArray[i])<roleListId.length) {
						roleVoteListArray = false;
					}
				}
				//console.log(roleVoteListArray + " : "+roleVoteList);


				var respVoteList = messageUsefullArray[2];

				respVoteList = respVoteList.replace("(","");
				respVoteList = respVoteList.replace(")","");
				var respVoteListArray = respVoteList.split(",");

				if (roleVoteListArray.length >=1 && respVoteListArray.length >=1 &&roleVoteListArray&& respVoteList!= " " && respVoteList!= "" && roleVoteList!= " " && roleVoteList!= "") {
					var newid = voteArray.length;
					voteArray.push(new VoteObject(newid,roleVoteListArray,userID,respVoteListArray,messageUsefullArray[0]));

					fs.writeFile("./data/vote.json",JSON.stringify(voteArray),function (err) {});

					voteMessage = getVoteMessage(voteArray[newid],userID);
					botSendMessageBis(channelID,"vote créé avec succès\n l'id de ce vote est "+newid+"\nPour voter entrez\"!vote "+newid+" n\" où n est un nombre de 1 à " +voteArray[newid].responceList.length+" pour le choix correspondant : \n"+voteMessage);
					//bot.sendMessage({
					//	to: channelID,
					//	message: "vote créé avec succès\n l'id de ce vote est "+newid+"\nPour voter entrez\"!vote "+newid+" n\" où n est un nombre de 1 à " +voteArray[newid].responceList.length+" pour le choix correspondant : \n"+voteMessage
					//});
				}
				else{
					errorReportVote(channelID,"vote mal formée (soit les rôles soit les réponces)");
				}
			}
			else{
				errorReportVote(channelID,"pas assez d'agrument");
			}


		}
		else if (messageArray[1] =="info") {
			if (messageArray.length >=3) {
				var idVoteInfo = parseInt(messageArray[2])

				if (!isNaN(idVoteInfo) && voteArray.length > idVoteInfo && idVoteInfo>=0) {
					botSendMessageBis(channelID,getVoteMessage(voteArray[idVoteInfo],userID));
					//bot.sendMessage({
					//	to: channelID,
					//	message: getVoteMessage(voteArray[idVoteInfo],userID)
					//});
				}
				else{
					botSendMessageBis(channelID,"id invalide ou inexistant");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "id invalide ou inexistant"
					//});
				}


			}
			else{
				errorReportVote(channelID,"attendu un numéro qui représente le numéro du vote après info");
			}
		}
		else if (!isNaN(parseInt(messageArray[1]))) {
			var voteId = parseInt(messageArray[1]);
			if (voteId < voteArray.length && canAccesVote(voteArray[voteId],userID)) {

				var boolAlreadyResp = false;
				for(var i in voteArray[voteId].userResp){
					if (voteArray[voteId].userResp[i] == userID) {
						boolAlreadyResp = true;
					}
				}

				if (!boolAlreadyResp) {
					if (voteArray[voteId].isClosed == false) {
						//code


						if (messageArray.length>=3 && !isNaN(parseInt(messageArray[2]))  ) {
							//console.log(messageArray);



							var resId = parseInt(messageArray[2]);

							if (resId-1 < voteArray[voteId].responceList.length && resId-1>=0){//code
								++voteArray[voteId].reponceCollection[resId-1];
								//console.log(voteArray[voteId])
								voteArray[voteId].userResp.push(userID);
								botSendMessageBis(channelID,"A voté !");
								/*bot.sendMessage({
									to: channelID,
									message: "A voté !"
								});*/
								fs.writeFile("./data/vote.json",JSON.stringify(voteArray),function (err) {});
							}
							else{
								errorReportVote(channelID,"numéro de réponse non valide");
							}

						}
						else{
							errorReportVote(channelID,"attendu le numéro de la réponse");
						}
					}
					else{
						errorReportVote(channelID,"le vote n'est plus ouvert");
					}
				}
				else{
					errorReportVote(channelID,"vous avez déjà voté");
				}
			}
			else{
				errorReportVote(channelID,"numéro du vote non valide");
			}
		}
		else if (messageArray[1] == "result") {
			if (messageArray.length>=3 && !isNaN(parseInt(messageArray[2]))  ) {
				var voteId = parseInt(messageArray[2]);
				if (voteId < voteArray.length && canAccesVote(voteArray[voteId],userID)) {
					botSendMessageBis(channelID,textResultVote(voteArray[voteId],userID));
					//bot.sendMessage({
					//	to: channelID,
					//	message: textResultVote(voteArray[voteId],userID)
					//});
				}
				else{
					errorReportVote(channelID,"numéro du vote non valide");

				}
			}
			else{
				errorReportVote(channelID,"attendu un numéro qui représente le numéro du vote après result");

			}
		}
		else if (messageArray[1] == "close") {
			if (messageArray.length>=3 && !isNaN(parseInt(messageArray[2]))  ) {
				var voteId = parseInt(messageArray[2]);
				if (voteId < voteArray.length && userID == voteArray[voteId].ownerId) {
					voteArray[voteId].isClosed = true;
					botSendMessageBis(channelID,"vote fermé");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "vote fermé"
					//});
				}
				else{
					errorReportVote(channelID,"numéro du vote non valide");

				}
			}
			else{
				errorReportVote(channelID,"attendu un numéro qui représente le numéro du vote après close");

			}
		}
		else if (messageArray[1] == "open") {
			if (messageArray.length>=3 && !isNaN(parseInt(messageArray[2]))  ) {
				var voteId = parseInt(messageArray[2]);
				if (voteId < voteArray.length && userID == voteArray[voteId].ownerId) {
					voteArray[voteId].isClosed = false;
					botSendMessageBis(channelID,"vote (re-ouvert)");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "vote (re-)ouvert"
					//});
				}
				else{
					errorReportVote(channelID,"numéro du vote non valide");

				}
			}
			else{
				errorReportVote(channelID,"attendu un numéro qui représente le numéro du vote après close");

			}
		}
		else if (messageArray[1] == "list") {
			var m = "liste des votes en cours:";
			for (var i in voteArray){
				if (canAccesVote(voteArray[i],userID) /*&&!voteArray[i].isClosed*/) {
					m +="\n "+i+" : " +voteArray[i].question;
					if (voteArray[i].isClosed) {
						m += " (fermé)"
					}
				}
			}
			botSendMessageBis(channelID,m);
			//bot.sendMessage({
			//	to: channelID,
			//	message: m
			//});

		}
		else{ // si aucun élément n'est juste
			//console.log(!isNaN(parseInt(messageArray[1])) + " " + parseInt(messageArray[1]) + " "+messageArray[1])
			errorReportVote(channelID);
		}

		fs.writeFile("./data/vote.json",JSON.stringify(voteArray),function (err) {})
	}

}



/***************************************************************************************************************************************************************/

function banUserCommandManager(user, userID, channelID, message, rawEvent){
	/*
	 * gère ce que le bot fait losr de l'appelle de la commande !ban
	 * forme du message attendu !ban <@id> time resaon
	 * time en heurs
	 */

	var messageArray = message.split(" ");
	var messageReason = ""
	if (messageArray.length > 3) {
		for(var i=3; i < messageArray.length;++i){
			messageReason+= messageArray[i]+" ";
		}
	}
	// the second argument est optionelle
	if (messageArray.length > 2) {
		var userMessage = messageArray[1];

		userMessage = userMessage.replace("<@","");
		userMessage = userMessage.replace(">","");

		var time =  parseInt(messageArray[2])

		if (isNaN(time)|| time < 0) {
			botSendMessageBis(channelID,"time incorect expecting positive value");
			//bot.sendMessage({
			//	to: channelID,
			//	message: "time incorect expecting positive value"
			//});
		}
		else{
			//                                 s->ms h->s
			var m2 = banUser(userMessage,time*1000*3600,messageReason);
			if (m2[0]) {

				botSendMessageBis(channelID,m2[1]);

				//bot.sendMessage({
				//	to: channelID,
				//	message: m2[1]
				//});
				//setTimeout(
				//	   function(){
				//		bot.sendMessage({
				//			to: channel.botLogChannelId,
				//			message: "<@"+userID+"> : ban "+messageArray[1]
				//		});
				//	   },1000);
				botSendMessageBis(channel.botLogChannelId,"<@"+userID+"> : ban "+messageArray[1]);
			}
			else{
				botSendMessageBis(channelID,"error : "+m2[1])
				//bot.sendMessage({
				//	to: channelID,
				//	message: "error : "+m2[1]
				//});
			}

		}
	}
	else{
		botSendMessageBis(channelID,"too few argument expecting !ban @userName time reason\n where teh reason in optional");
		//bot.sendMessage({
		//	to: channelID,
		//	message: "too few argument expecting !ban @userName time reason\n where teh reason in optional"
		//});
	}


}


function banUser(userID,time,reason){
	/* userID : id de l'utilisateur a ban
	 * time : le temps en ms du ban
	 * reason : string optionelle pour dire pourquoi l'utilisateur à été ban
	 */
	try{
		var userInDiscordServeur=false; // si l'utilisateur est dans le serv discord


		for (var i in bot["servers"][discordServeurId]["members"]){ // regarde au travert de la list des membre du serveur
			if (i == userID) {

				userInDiscordServeur = true;
			}
		}



		if (userInDiscordServeur) {
			updateUserStatus();

			var posUser = -1;
			for (var i in userListFaction){ // check au travet de la list
				if (userID == userListFaction[i].userID) {
					userIdAlreadyIn = true;
					posUser = i;
				}
			}
			if (posUser == -1 ) {
				return [false,"utilisateur dans la list introuvable après un update de la liste mais il est sur le serveur discord."]
			}
			else{

				if (! isAdminFunc(userID) && !isBanFunc(userID) && !(userID == bot["id"]) ) {
					userListFaction[posUser].roleBeforeBan = [];
					var timeoutInterval =2000;// 2000 to let me the tome to do other thing
					//var rid
					for (var j in  bot["servers"][discordServeurId]["members"][userID]["roles"]){
						var rid = bot["servers"][discordServeurId]["members"][userID]["roles"][j];
						if ( rid != role.banRole.id) {
							userListFaction[posUser].roleBeforeBan.push(rid)
							//setTimeout(
							//	   function(rid,userID){
							//		//console.log(rid+" "+userID+" "+discordServeurId)
							//		bot.removeFromRole({
							//			server: discordServeurId,
							//			user: userID,
							//			role: rid
							//		});
							//	   },
							//	   timeoutInterval,rid,userID
							//);

							botRemoveFromRoleBis(discordServeurId,userID,rid);

							timeoutInterval += 1000;
						}

					}

					//setTimeout(
					//	function(){
					//	     bot.addToRole({
					//		     server: discordServeurId,
					//		     user: userID,
					//		     role: role.banRole.id
					//	     });
					//	},timeoutInterval);
					botAddToRoleBis(discordServeurId,userID,role.banRole.id);
					timeoutInterval += 1000
					userListFaction[posUser].banUntil = Date.now() + time;
					userListFaction[posUser].banReason = reason;

					pendingOperation.addOpperation(function(posUser){

						userListFaction[posUser].isBan = true;

						writeUserList();
						banManager();
					},posUser);


					return [true,"user ban"];

				}
				else if(isAdminFunc(userID) || (userID == bot["id"])){
					return [false,"cannot ban an admin or the bot"];
				}
				else{
					return [false,"user already banned"];
				}
			}
		}
		else{
			return [false,"id ("+userID+") d'utilisateur invalide"];
		}

	}
	catch(e){
		console.log("crash in banUser function");
		return [false,"function crash"];
	}
}




function unbanCommandManager(user, userID, channelID, message, rawEvent){
	/*
	 * gère ce qui ce passe quand la comamnde !unban est appeler
	 * demande !unban <@id>
	 */
	var messageArray = message.split(" ");
	var messageReason = "";
	if (messageArray.length > 1) {
		var userMessage = messageArray[1];

		userMessage = userMessage.replace("<@","");
		userMessage = userMessage.replace(">","");
		if (userMessage == userID) {
			botSendMessageBis(channelID,"vous ne pouvez pas vous débanir vous même");
			//bot.sendMessage({
			//	to: channelID,
			//	message: "vous ne pouvez pas vous débanir vous même"
			//});
		}
		else{


			var m2 = unban(userMessage);
			if (m2[0]) {
				botSendMessageBis(channelID,"user unbanned");
				//bot.sendMessage({
				//	to: channelID,
				//	message: "user unbanned"
				//});
				botSendMessageBis(channel.botLogChannelId,"<@"+userID+"> : unban "+messageArray[1]);
				//setTimeout(
				//	function(){
				//	     bot.sendMessage({
				//		     to: channel.botLogChannelId,
				//		     message: "<@"+userID+"> : unban "+messageArray[1]
				//	     });
				//	},1000);
			}
			else{
				botSendMessageBis(channelID,"error : "+m2[1])
				//bot.sendMessage({
				//	to: channelID,
				//	message: "error : "+m2[1]
				//});
			}
		}
	}
	else{
		botSendMessageBis(channelID,"expecting @userName");
		//bot.sendMessage({
		//	to: channelID,
		//	message: "expecting @userName"
		//});
	}
}

function unban(userID) {
	/*
	 * deban un utilisateur
	 */
	var posUser = -1;
	for (var i in userListFaction){ // check au travet de la list
		if (userID == userListFaction[i].userID) {

			posUser = i;
		}
	}
	if (posUser == -1 ) {
		return [false,"utilisateur dans la list introuvable après un update de la liste mais il est sur le serveur discord. veuiller contatcer un admin SVP"];
	}
	else if(isBanFunc(userID)){
		var timeoutInterval = 2000
		//userListFaction[posUser].isBan = false;
		//setTimeout(
		//	function(userID){
		//	     bot.removeFromRole({
		//		     server: discordServeurId,
		//		     user: userID,
		//		     role: role.banRole.id
		//	     });
		//	},timeoutInterval,userID);
		botRemoveFromRoleBis(discordServeurId,userID,role.banRole.id);

		timeoutInterval+=1000;
		for (var i in userListFaction[posUser].roleBeforeBan){
			//setTimeout(
			//	function(userID,k,posUser){
			//		console.log(k,userListFaction[posUser].roleBeforeBan[k]);
			//		bot.addToRole({
			//		     server: discordServeurId,
			//		     user: userID,
			//		     role: userListFaction[posUser].roleBeforeBan[k]
			//		});
			//	},timeoutInterval,userID,i,posUser);
			//console.log(i,userListFaction[posUser].roleBeforeBan[i]);
			botAddToRoleBis(discordServeurId,userID,userListFaction[posUser].roleBeforeBan[i])
			timeoutInterval+=1000;
		}
		pendingOperation.addOpperation(function(posUser){

			userListFaction[posUser].isBan = false;
			updateUserStatus();
			banManager();
		},posUser);

		//setTimeout(function(posUser){
		//
		//	userListFaction[posUser].isBan = false;
		//	updateUserStatus();
		//	banManager();
		//	},timeoutInterval,posUser);

		return [true,"user unbanned",timeoutInterval];
	}
	else{
		return [false,"can not unban not banned user"];
	}
}

function banManager(){
	/*
	 * gère les ban (donc dban quand le ban est fini, inique eui est ban etc)
	 *
	 *
	 */

	/*var timeoutBManger = 0

	for (var i in userListFaction) {
		if (userListFaction[i].isBan && Date.now()-userListFaction[i].banUntil<0) {
			setTimeout()
		}
	}*/


	for (var i in userListFaction) {
		if (userListFaction[i].isBan && -Date.now()+userListFaction[i].banUntil<0) {
			botSendMessageBis(channel.botLogChannelId,"<@"+userListFaction[i].userID+"> auto unbanned")
			unban(userListFaction[i].userID);
		}
	}


	pendingOperation.addOpperation(function(){
		bot.getMessages({
				channel: channel.banChanId,
				limit: 50 //If 'limit' isn't added, it defaults to 50, the Discord default, 100 is the max.
			}, function(error, messageArr) {
				if (error) {
				       console.log(error)
				}
				else{
					var regExpBan = new RegExp("^liste des utilisateurs bannis [:] *");
					var regExpAv = new RegExp("^liste des avertissements [:] *");
					var boolBan = false;
					var boolAv = false;
					var posBan = -1;
					var posAv = -1;
					var timeout = 500;
					var timeoutIncrease = 750;
					for (var i in messageArr){
						if (regExpBan.test(messageArr[i].content) && !boolBan) {
							boolBan = true;
							posBan =i;

							pendingOperation.addOpperation(function(id){
								bot.editMessage({
									channel: channel.banChanId,
									messageID: id,
									message:"liste des utilisateurs bannis : \n"+getBanMessage()
								});
							},messageArr[i].id)

							//setTimeout(function(id){
							//	bot.editMessage({
							//		channel: channel.banChanId,
							//		messageID: id,
							//		message:"liste des utilisateurs bannis : \n"+getBanMessage()
							//	});
							//},timeout,messageArr[i].id);
							timeout += timeoutIncrease;
						}
						else if (regExpAv.test(messageArr[i].content) && ! boolAv) {
							boolAv = true;
							posAv = i;
							pendingOperation.addOpperation(function(id){
								bot.editMessage({
									channel: channel.banChanId,
									messageID: id,
									message:"liste des avertissements : \n"+getAvMessage()
								});
							},messageArr[i].id)
							//setTimeout(function(id){
							//	bot.editMessage({
							//		channel: channel.banChanId,
							//		messageID: id,
							//		message:"liste des avertissements : \n"+getAvMessage()
							//	});
							//},timeout,messageArr[i].id);
							timeout += timeoutIncrease;;
						}
						else{
							pendingOperation.addOpperation(function(id){
								bot.deleteMessage({
									channel: channel.banChanId,
									messageID: id
								});
							},messageArr[i].id)
							//setTimeout(function(id){
							//	bot.deleteMessage({
							//		channel: channel.banChanId,
							//		messageID: id
							//	});
							//	},timeout,messageArr[i].id);
							timeout += timeoutIncrease;
						}
						// TODO message auto s'il nexiste pas
					}
					if (!boolAv) {
						pendingOperation.addOpperation(function(){
							bot.sendMessage({
								channel: channel.banChanId,
								message:"liste des avertissements : \n"+getAvMessage()
							});
						})
					}
					if (!boolBan) {
						pendingOperation.addOpperation(function(){
							bot.sendMessage({
								channel: channel.banChanId,
								message:"liste des utilisateurs bannis : \n"+getBanMessage()
							});
						})
					}
				}
		    });
	})
}

function getBanMessage(){
	var m = "";
	for (var i in userListFaction) {
		if (userListFaction[i].isBan && -Date.now()+userListFaction[i].banUntil>0) {
			m+= "<@"+userListFaction[i].userID+"> : ";
			if (userListFaction[i].banReason!= undefined && userListFaction[i].banReason !="" ) {
				m+= "raison : "+userListFaction[i].banReason+"; ";
			}
			var banTime = -Date.now()+userListFaction[i].banUntil;
			var banHour = Math.floor(banTime/(1000*3600));
			var banMinute = Math.floor((banTime-banHour*1000*3600)/(1000*60));
			m+= "temps de banissement restant " +banHour+" h  "+banMinute+" m";
			m+="\n";
		}
		else if (userListFaction[i].isBan) {
			m+= "<@"+userListFaction[i].userID+"> : need to be debanned";
		}
	}
	return m;
}
function getAvMessage(){
	var m = "";
	for (var i in userListFaction) {
		if (userListFaction[i].avertissement >0) {
			m+= "<@"+userListFaction[i].userID+"> : "+userListFaction[i].avertissement+ " avertissements";

		}
	}
	return m;
}
/***************************************************************************************************************************************************************/

var isAdminFunc = function(userID){
	var retrunval = false;

	for(var i in userList.users){
		if (userID ==userList.users[i].userID ) {
			return userList.users[i].isAdmin;
		}
	}
	if (userListFaction != undefined) {
		for(var i in userListFaction){
			if (userID ==userListFaction[i].userID ) {
				return userListFaction[i].isAdmin;
			}
		}
	}


	return retrunval;
}
var isModoFunc = function(userID){
	var retrunval = false;

	for(var i in userList.users){
		if (userID ==userList.users[i].userID ) {
			return userList.users[i].isModo;
		}
	}
	if (userListFaction != undefined) {
		for(var i in userListFaction){
			if (userID ==userListFaction[i].userID ) {
				return userListFaction[i].isModo;
			}
		}
	}

	return retrunval;
}

var isBanFunc = function(userID){
	retrunval = false;

	/*for(var i in userList.users){
		if (userID ==userList.users[i].userID ) {
			return userList.users[i].isBan;
		}
	}*/
	if (userListFaction != undefined) {
		for(var i in userListFaction){
			if (userID ==userListFaction[i].userID ) {
				return userListFaction[i].isBan;
			}
		}
	}

	return retrunval;
}


function getAdminAtTexte(){
	/*
	 * retourne un texte avec <@id> avec els id des admin
	 */
	var supMessage = "";
	if (userListFaction != undefined) {
		for(var i in userListFaction){
			if ( userListFaction[i].isAdmin) {
				supMessage +="<@"+userListFaction[i].userID+"> ";
			}
		}
	}
	return supMessage;
}

// object commande
function commandC(testInputp,funcp,inputDescriptionp,descrp,showHelpp) {
    this.testInput = testInputp; // fonction de test sur l'entrée
    this.func = funcp; // fonction a executer
    this.inputDescription= inputDescriptionp; // aide : affiche l'input demandé
    this.descr = descrp; // aide : afffiche ce que la commande fait
    this.showHelp= showHelpp; // fonction qui détermine si l'aide
}


/***************************************************************************************************************************************************************/
/***************************************************************************************************************************************************************/

var truefunc = function(){ // retourne toujours vrai
    return true
}
var notBotFunc = function(user, userID, channelID, message, rawEvent){ // retourne toujours vrai
   return !(userID == bot["id"]);
}
// liste des commandes


var commandList = [new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!ping"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"pong")
					//bot.sendMessage({
					//	to: channelID,
					//	message: "pong"
					//});
				},
				"!ping", "affiche pong",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!help"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					var messageTemp = "";
					for (var i in commandListAll){
						if (commandListAll[i].showHelp(user, userID, channelID, message, rawEvent)) {
							messageTemp += commandListAll[i].inputDescription + " : "+commandListAll[i].descr+"\n"


						}
					}
					botSendMessageBis(channelID,messageTemp);
					//bot.sendMessage({
					//	to: channelID,
					//	message: messageTemp
					//});

				},
				"!help", "affiche la liste des commandes",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
				    var infoReg = new RegExp("^!info*")
				    if(infoReg.test(message)){
					    return true
				    }
				    else{
					    return false
				    }
				},
				function(user, userID, channelID, message, rawEvent){
					console.log(message)
					var mToSend ='user : '+user +'; userID : '+userID+'; channelID : '+channelID+'; message : '+message +"; server : "+bot.serverFromChannel(channelID);
					if (bot.serverFromChannel(channelID) != undefined) {
						mToSend+= "\nce message s'auto-détruira dans 5 secondes (Pour voir ce message plus longtemps envoyez un message privé à <@"+bot.id+">)"
					}
					// TODO pendig OP
					bot.sendMessage({
						to: channelID,
						message: mToSend
					},function(err,res){
						var channelID = res.channel_id
						//console.log(res)
						if (bot.serverFromChannel(channelID) != undefined) {

							setTimeout(function(messageID,channelID){
								//console.log(channelID+":"+messageID)
								bot.editMessage({
									channel: channelID,
									messageID: messageID,
									message: "[BOOM]\nce message s'auto-détruira dans 5 secondes (Pour voir ce message plus longtemps envoyez un message privé à <@"+bot.id+">)"
								})
							},5000,res.id,channelID)
						}
					});
					//console.log(rawEvent.d.id+" : "+ bot.serverFromChannel(channelID))

				},
				"!info", "retourne les infos sur le message",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!mort"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"A MORT HELIOR");
					/*bot.sendMessage({
					    to: channelID,
					    message: "A MORT HELIOR"
					});*/
				},
				"!mort", "A MORT HELIOR",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
				    if(message=="!about"){
					    return true
				    }
				    else{
					    return false
				    }
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"Bonjour, je suis Chicken Bot.\n\n j'ai été créé le 3 janvier 2016 par ChickenStorm pour le serveur Asylamba 2.0 sur Discord.\n\n"+
					    "Mon dépôt git se trouve sous https://github.com/ChickenStorm/ChickenBot\n\n entrez \"!help\" pour voir la liste de mes commandes");
					//bot.sendMessage({
					//    to: channelID,
					//    message: "Bonjour, je suis Chicken Bot.\n\n j'ai été créé le 3 janvier 2016 par ChickenStorm pour le serveur Asylamba 2.0 sur Discord.\n\n"+
					//    "Mon dépôt git se trouve sous https://github.com/ChickenStorm/ChickenBot\n\n entrez \"!help\" pour voir la liste de mes commandes"
					//
					//});
				},
				"!about", "à propos de ce bot",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!me"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					var mToSend = "Votre identifiant est : "+userID;
					if (bot.serverFromChannel(channelID) != undefined) {
						mToSend+= "\nce message s'auto-détruira dans 5 secondes (Pour voir ce message plus longtemps envoyez un message privé à <@"+bot.id+">)"
					}
					// TODO pending
					bot.sendMessage({
						to: channelID,
						message: mToSend
					},function(err,res){
						var channelID = res.channel_id
						//console.log(res)
						if (bot.serverFromChannel(channelID) != undefined) {

							setTimeout(function(messageID,channelID){
								//console.log(channelID+":"+messageID)
								bot.editMessage({
									channel: channelID,
									messageID: messageID,
									message: "[BOOM]\nce message s'auto-détruira dans 5 secondes (Pour voir ce message plus longtemps envoyez un message privé à <@"+bot.id+">)"
								})
							},5000,res.id,channelID)
						}
					});

					/*bot.sendMessage({
					    to: channelID,
					    message: "Votre identifiant est : "+userID

					});*/
				},
				"!me", "retourne l'user id",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var atAdminRegExp = new RegExp("@admin")
					if(atAdminRegExp.test(message) && !(userID == bot["id"])){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					var atAdminRegExp = new RegExp("@admin")
					var adminsList = [];
					var supMessage = ""
					//for(var i in userList.users){
					//	if (userList.users[i].isAdmin ) {
					//		supMessage +="<@"+userList.users[i].userID+"> ";
					//		/*for (var j in bot["servers"]["132106417703354378"]["members"]){
					//			if (j == userList.users[i].userID) {
					//				supMessage+="@"+bot["servers"]["132106417703354378"]["members"][j]["user"]["username"]+" ";
					//			}
					//		}*/
					//	}
					//}
					if (userListFaction != undefined) {
						for(var i in userListFaction){
							if ( userListFaction[i].isAdmin) {
								supMessage +="<@"+userListFaction[i].userID+"> ";
							}
						}
					}


					/*for (var i in bot["servers"]["132106417703354378"]["members"]){
						if (i == data.userID) {
							userInDiscordServeur = true;
						}
					}*/
					botSendMessageBis(channelID,"<@"+userID+"> :"+message.replace(atAdminRegExp,"("+supMessage+")"));
					//bot.sendMessage({
					//    to: channelID,
					//    message: "<@"+userID+"> :"+message.replace(atAdminRegExp,"("+supMessage+")")
					//
					//});
				},
				"@admin", "appelle les admins quelque soit la position @admin dans le message",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var atAdminRegExp = new RegExp("@modo")
					if(atAdminRegExp.test(message) && !(userID == bot["id"])){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					var atAdminRegExp = new RegExp("@modo")
					var adminsList = [];
					var supMessage = ""
					//for(var i in userList.users){
					//	if (userList.users[i].isModo ) {
					//		supMessage +="<@"+userList.users[i].userID+"> ";
					//		/*for (var j in bot["servers"]["132106417703354378"]["members"]){
					//			if (j == userList.users[i].userID) {
					//				supMessage+="@"+bot["servers"]["132106417703354378"]["members"][j]["user"]["username"]+" ";
					//			}
					//		}*/
					//	}
					//}
					if (userListFaction != undefined) {
						for(var i in userListFaction){
							if ( userListFaction[i].isModo) {
								supMessage +="<@"+userListFaction[i].userID+"> ";
							}
						}
					}


					/*for (var i in bot["servers"]["132106417703354378"]["members"]){
						if (i == data.userID) {
							userInDiscordServeur = true;
						}
					}*/
					botSendMessageBis(channelID,"<@"+userID+"> :"+message.replace(atAdminRegExp,"("+supMessage+")"));
					//bot.sendMessage({
					//    to: channelID,
					//    message: "<@"+userID+"> :"+message.replace(atAdminRegExp,"("+supMessage+")")
					//
					//});
				},
				"@modo", "appelle les modérateurs quelque soit la position du @modo dans le message",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!fact"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,texts.facts[Math.floor(Math.random()*texts.facts.length)]);
					//bot.sendMessage({
					//    to: channelID,
					//    message: texts.facts[Math.floor(Math.random()*texts.facts.length)]
					//
					//});
				},
				"!fact", "retourne un fait amusant",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!joke"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,texts.jokes[Math.floor(Math.random()*texts.jokes.length)]);
					//bot.sendMessage({
					//    to: channelID,
					//    message: texts.jokes[Math.floor(Math.random()*texts.jokes.length)]
					//
					//});
				},
				"!joke", "retourne une blague",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!quote"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,texts.quotes[Math.floor(Math.random()*texts.quotes.length)]);
					//bot.sendMessage({
					//	to: channelID,
					//	message: texts.quotes[Math.floor(Math.random()*texts.quotes.length)]
					//
					//});
				},
				"!quote", "retourne une citation",truefunc
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!Prière" || message=="!prière" || message=="!Priere" || message=="!priere"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
						var randomNumberSpetial = Math.random();

						if (randomNumberSpetial >= 0.995 || (user == "ChickenStorm" && randomNumberSpetial >= 7/8) ) {
								botSendMessageBis(channelID,"?) Le dieux poulet entend ta prière, il te conseil d'écoute les poulets.");
						}
						else{

								var randomNumber;
								if (userID == "132931838841716736") { // SufX (L'Ambassadeur)
										randomNumber = 3; // not so random
								}
								else{
										randomNumber = Math.floor(Math.random()*texts.pray.length);
								}

								var randomNumberDisplay = randomNumber+1;
								botSendMessageBis(channelID,randomNumberDisplay.toString()+") "+texts.pray[randomNumber]);

						}
					//bot.sendMessage({
					//	to: channelID,
					//	message: texts.quotes[Math.floor(Math.random()*texts.quotes.length)]
					//
					//});
				},
				"!Prière", "Entendez ma prière",truefunc
			),
			new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!Dieux" || message=="!dieux"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

						botSendMessageBis(channelID,"les dieux : http://asylamba.com/wiki/page-162");
					//bot.sendMessage({
					//	to: channelID,
					//	message: texts.quotes[Math.floor(Math.random()*texts.quotes.length)]
					//
					//});
				},
				"!Dieux", "lien wiki des dieux",truefunc
			),

		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var voteRegExp = new RegExp("^!vote *")
					if(voteRegExp.test(message) && !(userID == bot["id"])){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					voteFunctionManager(user, userID, channelID, message, rawEvent);
				},
				"!vote *", "entrer !vote help pour plus d'information",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!roleList"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					var messageToSend = "";
					for (var i in roleListId){
						messageToSend+=i + " : "+ roleListName[i].replace("@everyone","everyone")+"\n";
					}
					botSendMessageBis(channelID,messageToSend);
					//bot.sendMessage({
					//	to: channelID,
					//	message: messageToSend
					//
					//});
				},
				"!roleList", "affiche la liste des roles",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!chickenLove" || message=="!ChickenLove" ){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					/*bot.sendMessage({
					    to: channelID,
					    message: ":heart: :heart: :heart: <@93784478299725824> :heart: :heart: :heart:"

					});*/
					botSendMessageBis(channelID,":heart: :heart: :heart: ChickenStorm :heart: :heart: :heart:");
					//bot.sendMessage({
					//	to: channelID,
					//	message: ":heart: :heart: :heart: ChickenStorm :heart: :heart: :heart:"
					//
					//});
				},
				"!chickenLove", "montez votre affection pour ChickenStorm",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!biscuit" || message=="!biscuits" ){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					botSendMessageBis(channelID," Trois Biscuits pour les néo-humaniste sous le ciel,\n Sept pour les seigneurs impériaux dans leurs demeures de pierre,\n Neuf pour la Ligue Seldarine,\n Un Biscuit pour Luneverte sur son sombre trône,\n Dans la Galaxie de l\'Oeil où s\'étendent les ombres\n Un Biscuit pour les gouverner tous\n Un Biscuit pour les trouver\n Un Biscuit pour les amener tous,\n Et dans la gourmandise les lier\n Dans la Galaxie de l\'Oeil où s\'étendent les ombres.");

					//bot.sendMessage({
					//	to: channelID,
					//	message: " Trois Biscuits pour les néo-humaniste sous le ciel,\n Sept pour les seigneurs impériaux dans leurs demeures de pierre,\n Neuf pour la Ligue Seldarine,\n Un Biscuit pour Luneverte sur son sombre trône,\n Dans la Galaxie de l\'Oeil où s\'étendent les ombres\n Un Biscuit pour les gouverner tous\n Un Biscuit pour les trouver\n Un Biscuit pour les amener tous,\n Et dans la gourmandise les lier\n Dans la Galaxie de l\'Oeil où s\'étendent les ombres."
					//
					//});
				},
				"!biscuit", "que sont vraiment les biscuite de lunverte",truefunc
			),
		   	new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!Falmala" || message=="!falmala" ){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"Je suis de retour pour jouer sans recours\nAfin de préserver mon bar de la dévastation\net ralier à ma cause toutes les factions\nAfin de distribuer l'amour et des fessées\nAfin d'étendre mes pratiques dans toutes les contrées\n\nDame Falmala\nAussi belle que sévère\nVenez dans ma cave\nVous verrez ce qu'on peu y faire\n\n... Oui ... C'est clair !!!");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "Je suis de retour pour jouer sans recours\nAfin de préserver mon bar de la dévastation\net ralier à ma cause toutes les factions\nAfin de distribuer l'amour et des fessées\nAfin d'étendre mes pratiques dans toutes les contrées\n\nDame Falmala\nAussi belle que sévère\nVenez dans ma cave\nVous verrez ce qu'on peu y faire\n\n... Oui ... C'est clair !!!"
					//
					//});
				},
				"!Falmala", "Dame Falmala est de retour !",truefunc
			),
			new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!Zahius" || message=="!zahius" ){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"Je m'appelle Zahius\nOn m’appelle Crésus\nVoulez-vous des crédits ?\nJe prête à taux d’ami.\n\nOn me dit radin comme un clou\nMais c’est que j’aime les sous\nSi vous voulez prendre mon or,\nPrenez garde, je mord !\n\nDe part mes histoires\nVous allez tout savoir,\nJe suis un filou\nJ’aime le complot, les sous\n\nSeul à la ligue j'ai emprunté,\nOn a dit que j'ai volé\nOn me demande ou son les milliards\nBien caché dans mes tiroirs\n\nDe toute la galaxie de l’oeil,\nJe garde dans mon recueil,\nLeurs emprunts et leur emplettes\nIls me doivent tous une dette.");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "Je suis de retour pour jouer sans recours\nAfin de préserver mon bar de la dévastation\net ralier à ma cause toutes les factions\nAfin de distribuer l'amour et des fessées\nAfin d'étendre mes pratiques dans toutes les contrées\n\nDame Falmala\nAussi belle que sévère\nVenez dans ma cave\nVous verrez ce qu'on peu y faire\n\n... Oui ... C'est clair !!!"
					//
					//});
				},
				"!Zahius", "On m’appelle Crésus",truefunc
			),
			new commandC(
				function(user, userID, channelID, message, rawEvent){
					var regExpPres = new RegExp("^![Pp]r[ée]sident$")
					if(regExpPres.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"Tsintao - 11/07/2016 à 22:21\nMoi Président de la République, je m'efforcerai de conduire notre peuple vers la postérité\nMoi Présidente de la République, je tiendrai en echec les manipulations exterieurs voulant mettre a mal notre nation\nMoi Présidente de la République, je serai exemplaire, et j'attendrai de mes collaborateurs la meme exemplarité\nMoi Présidente de la République, je placerai Zahius au finance, car c'est un requin\nMoi Présidente de la République, je fournirai la wifi haut debit dans tous les hotel pour eviter que ça lag lors de mes deplacement\nMoi Présidente de la République, je mangerai 5 fruits et legumes par jours\nMoi Présidente de la République, j'equiperai les voitures de police avec des klaxonne rigolo\nMoi Présidente de la République, je diminuerai les prix des bonbons\nMoi Présidente de la République, je decreterai que les fetes de noel et nouvelle an auront lieu une fois par mois\nMoi Présidente de la République, je rajouterai 2 jours a la semaine, c'est deux jours seront chomé\nMoi Présidente de la République, je ferai que tous les gens soient joyeux et content\nMoi Présidente de la République, j'enleverai les taxes sur l'alcool et les prostitués\nMoi Présidente de la République, je ferai donnerai plus de moyen a nos dev pour leur nouveau jeu\nMoi Présidente de la République, je donnerai des phenix a tout le monde\nMoi Présidente de la République, je ferai du sport, mangez bougez");
					botSendMessageBis(channelID,"Moi Présidente de la République, je mettrais en place les journées de 4h, avec une grande sieste pour la digestion\nMoi Présidente de la République, j'areterai de dire des conneries\nMoi Présidente de la République, j'obligerai l'Empire a construire un mur qui lui meme financera\nMoi Présidente de la République, je terminerai ma croissance\nMoi Présidente de la République, je placerai des gens competents a des postes qui ne necessite aucune comptence\nMoi Présidente de la République, je ne flooderai plus le canal genral\nMoi Présidente de la République, je ferai la moral aux chefs des autres faction\nMoi Présidente de la République, je prendrai des planetes a nos enemis et ensuite je dirai que c'est pas de ma faute\nMoi Présidente de la République, je mettrai en place Dolphin Bot\nMoi Présidente de la République, je regarderai les matchs de foot avec Barack Obama, car c'est la classe\nMoi Présidente de la République, je couperai la 2nde jambe des unijambistes, car les voir sautiller me donne la nausée\nMoi Présidente de la République, je manque d'inspiration");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "Je suis de retour pour jouer sans recours\nAfin de préserver mon bar de la dévastation\net ralier à ma cause toutes les factions\nAfin de distribuer l'amour et des fessées\nAfin d'étendre mes pratiques dans toutes les contrées\n\nDame Falmala\nAussi belle que sévère\nVenez dans ma cave\nVous verrez ce qu'on peu y faire\n\n... Oui ... C'est clair !!!"
					//
					//});
				},
				"!Président", "Moi Président de la République, [...]",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!simulateur" ){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					botSendMessageBis(channelID,"simulateur de combat http://chickenbot.cloudapp.net:8080/simulateur");//https://dl.dropboxusercontent.com/u/110049848/Projecet_script_public/Asylamba_project_online_launcher.html ");
					//bot.sendMessage({
					//	to: channelID,
					//	message: "simulateur de combat https://dl.dropboxusercontent.com/u/110049848/Projecet_script_public/Asylamba_project_online_launcher.html "
					//
					//});
				},
				"!simulateur", "donne le lien du simulateur de combat",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!emp"){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					//botSendMessageBis(channelID,"Ephremester Archoura Pygrhodo");
					//botSendMessageBis(channelID,"http://www.pokepedia.fr/images/1/14/Professeur_Chen_RFVF.png\n **Professeur Chen**");
					botSendMessageBis(channelID,"https://cdn.discordapp.com/attachments/133980205793411072/226005348455022592/FB_IMG_1471674354566.jpg\n **Eris Valceciel**");
					//botSendMessageBis(channelID,"Alecto");
					//bot.sendMessage({
					//	to: channelID,
					//	//message: "Ifrahan"//"Son Altesse Empereur Régalion III, né Ifahan d'Elkeïon-Akhénien fils de l'archiduchesse Zéphara" // AIERIII13EIEAIEA17PSFAZFXM9EADDFPEEAG
					//	message: "Alecto"
					//});
				},
				"!emp", "affiche le nom complet de l'empereur",truefunc
				),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var rollDiceReExp = new RegExp("^!rollDice [1-9][0-9]{0,3}$")
					if(rollDiceReExp.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					var mArray = message.split(" ");
					botSendMessageBis(channelID,"le dé "+parseInt(mArray[1])+" affiche "+ Math.floor(Math.random()*parseInt(mArray[1])+1));
					//bot.sendMessage({
					//	to: channelID,
					//	message: "le dé "+parseInt(mArray[1])+" affiche "+ Math.floor(Math.random()*parseInt(mArray[1])+1)
					//});
				},
				"!rollDice n", "tire un nombre aléatoire entre 1 et n",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var newquoteReg = new RegExp("^!newquote *")
					if(newquoteReg.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					var arrayMess = message.split(" ");

					arrayMess.shift() // enlève le premier élément (i.e. !newquote)
					var messageToSend = "[quote] <@"+userID+"> : "+arrayMess.join(" ") + "\n from chanel <#"+channelID+">";

					botSendMessageBis(channelID,"quote proposée");
					botSendMessageBis(channel.botLogChannelId,messageToSend);
					botSendMessageBis(channel.chickenMPChan,messageToSend);

					//bot.sendMessage({
					//	to: channelID,
					//	message: "quote proposée"
					//});
					//bot.sendMessage({
					//	to: channel.botLogChannelId,
					//	message: messageToSend
					//});
					//bot.sendMessage({
					//	to: channel.chickenMPChan,
					//	message: messageToSend
					//});
				},
				"!newquote *", "propse une nouvelle quote (SVP dire de qui et quand)",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var reportReg = new RegExp("^!report *")
					if(reportReg.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					var arrayMess = message.split(" ");
					arrayMess.shift() // enlève le premier élément (i.e. !report)
					var messageToSend = "[report]  <@"+userID+"> : "+arrayMess.join(" ") + "\n from chanel <#"+channelID+">";

					arrayMess.shift() // enlève le premier élément
					botSendMessageBis(channelID,"report fait");
					botSendMessageBis(channel.botLogChannelId,messageToSend);
					botSendMessageBis(channel.chickenMPChan,messageToSend);
					//bot.sendMessage({
					//	to: channelID,
					//	message: "report fait"
					//});
					//bot.sendMessage({
					//	to: channel.botLogChannelId,
					//	message: messageToSend
					//});
					//bot.sendMessage({
					//	to: channel.chickenMPChan,
					//	message: messageToSend
					//});
					//
				},
				"!report *", "envoi un report de bug ou tout autre porblème",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var reportReg = new RegExp("^!idea *")
					if(reportReg.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					var arrayMess = message.split(" ");
					arrayMess.shift() // enlève le premier élément (i.e. !idea)
					var messageToSend = "[idea]  <@"+userID+"> : "+arrayMess.join(" ") + "\n from chanel <#"+channelID+">";

					arrayMess.shift() // enlève le premier élément
					botSendMessageBis(channelID,"idée proposée");
					botSendMessageBis(channel.botLogChannelId,messageToSend);
					botSendMessageBis(channel.chickenMPChan,messageToSend);
					//bot.sendMessage({
					//	to: channelID,
					//	message: "idée proposée"
					//});
					//bot.sendMessage({
					//	to: channel.botLogChannelId,
					//	message: messageToSend
					//});
					//bot.sendMessage({
					//	to: channel.chickenMPChan,
					//	message: messageToSend
					//});

				},
				"!idea *", "proposer une idée pour le bot / demander votre propre commande / une suggestion en générale",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var bgReg = new RegExp("^![gG]et[Ii]n[bB][gG]"); //getInBg
					if(bgReg.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					for (var i in userListFaction){
						if (userListFaction[i].userID == userID) {
							if (userListFaction[i].notifList==undefined) {
								userListFaction[i].notifList ={};
							}
							userListFaction[i].notifList.bg = true;
						}
					}

					botAddToRoleBis(discordServeurId,userID,role.bgRole.id);
					botSendMessageBis(channelID,"vous avez été ajouté à la liste @BG");

					//bot.sendMessage({
					//	to: channelID,
					//	message: "idée proposée"
					//});
					//bot.sendMessage({
					//	to: channel.botLogChannelId,
					//	message: messageToSend
					//});
					//bot.sendMessage({
					//	to: channel.chickenMPChan,
					//	message: messageToSend
					//});

				},
				"!getInBg", "entrer dans la liste des notification pour le @BG",truefunc
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					var bgReg = new RegExp("^![oO]ut[oO]f[bB][Gg]"); //outOfBg
					if(bgReg.test(message)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					for (var i in userListFaction){
						if (userListFaction[i].userID == userID) {
							if (userListFaction[i].notifList==undefined) {
								userListFaction[i].notifList ={};
							}
							userListFaction[i].notifList.bg = false;
						}
					}
					botSendMessageBis(channelID,"vous avez été retiré de la liste @BG");
					botRemoveFromRoleBis(discordServeurId,userID,role.bgRole.id);
					//bot.sendMessage({
					//	to: channelID,
					//	message: "idée proposée"
					//});
					//bot.sendMessage({
					//	to: channel.botLogChannelId,
					//	message: messageToSend
					//});
					//bot.sendMessage({
					//	to: channel.chickenMPChan,
					//	message: messageToSend
					//});

				},
				"!outOfBg", "sortire dans la liste des notification pour le @BG",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var bgReg = new RegExp("@[Bb][Gg]")
					if(bgReg.test(message) && !(userID == bot["id"])){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){
					var bgReg = new RegExp("@[Bb][Gg]")
					var adminsList = [];
					var supMessage = "";
					//for(var i in userList.users){
					//	if (userList.users[i].isModo ) {
					//		supMessage +="<@"+userList.users[i].userID+"> ";
					//		/*for (var j in bot["servers"]["132106417703354378"]["members"]){
					//			if (j == userList.users[i].userID) {
					//				supMessage+="@"+bot["servers"]["132106417703354378"]["members"][j]["user"]["username"]+" ";
					//			}
					//		}*/
					//	}
					//}
					if (userListFaction != undefined) {
						for(var i in userListFaction){
							if ( userListFaction[i].notifList!= undefined && userListFaction[i].notifList.bg != undefined &&userListFaction[i].notifList.bg) {
								supMessage +="<@"+userListFaction[i].userID+"> ";
							}
						}
					}


					/*for (var i in bot["servers"]["132106417703354378"]["members"]){
						if (i == data.userID) {
							userInDiscordServeur = true;
						}
					}*/
					botSendMessageBis(channelID,"<@"+userID+"> :"+message.replace(bgReg,"("+supMessage+")"));
					//bot.sendMessage({
					//    to: channelID,
					//    message: "<@"+userID+"> :"+message.replace(atAdminRegExp,"("+supMessage+")")
					//
					//});
				},
				"@BG", "Notifie les personnes du background",truefunc
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					var bgReg = new RegExp("^!get[Ii]nvite")
					if(bgReg.test(message) && !(userID == bot["id"])){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					for(var i in userListFaction){
						if (userID == userListFaction[i].userID) {
							postemp = i;
						}
					}
					bot.createInvite({
						channel: servers.getServerIdFromFactionColor(userListFaction[postemp].factionColor),
						max_users: 30, //Optional
						max_age: 1200, //Optional 1Jour
						temporary: true, //Optional
						xkcdpass: false //Optional
					 },function(error, response){
						if (error == undefined) {

							// TODO  more reliable methode
							botSendMessageBis(userListFaction[postemp].userID,"Voici votre lien d'invitation pour le server de votre faction Asylamba "+invitationPrefix+"/"+response.code)
						}
					 }
				);
				},
				"!getInvite", "reçoit une invitation de votre server de faction",truefunc
			),




]
var commandManage = [
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!enable" && isModoFunc(userID)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					enable = true;
					bot.sendMessage({
						to: channelID,
						message: "enable"
					});
					/*bot.setPresence({
						idle_since: null,
						game: "Status : enable"
					});*/
					switchStatusMessage();
				},
				"!enable", "active le bot (modo)",function(user, userID, channelID, message, rawEvent){return isModoFunc(userID) || isAdminFunc(userID)}
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!disable" && isModoFunc(userID)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					enable = false;
					bot.sendMessage({
						to: channelID,
						message: "sleeping"
					});
					/*bot.setPresence({
						idle_since: Date.now(),
						game: "Status : disable"
					});*/
					switchStatusMessage();

				},
				"!disable", "désactive le bot (modo)",function(user, userID, channelID, message, rawEvent){return isModoFunc(userID) || isAdminFunc(userID)}
			),
		   new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!exit" && isAdminFunc(userID)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					enable = true;
					bot.sendMessage({
						to: channelID,
						message: "stopping"
					});
					bot.setPresence({
						idle_since: Date.now(),
						game: "Status : stop (offline)"
					});
					fs.writeFile("./data/vote.json",JSON.stringify(voteArray),function (err) {
						fs.writeFile("./data/user.json",JSON.stringify(userListFaction),function (err) {
							setTimeout(function(){process.exit(0)}, 1000); // ça généère une erreur :(
						});
					});



				},
				"!exit", "arrête le bot (admin)",function(user, userID, channelID, message, rawEvent){return isAdminFunc(userID)}
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!forceEnableToggle" && isAdminFunc(userID)){
						return true;
					}
					else{
						return false;
					}
				},
				function(user, userID, channelID, message, rawEvent){

					forceEnable = !forceEnable;

					if (forceEnable) {
						bot.sendMessage({
							to: channelID,
							message: "forceEnable on"
						});
						forceDisable = false;
					}
					else{
						bot.sendMessage({
							to: channelID,
							message: "forceEnable off"
						});
					}
					switchStatusMessage();

				},
				"!forceEnableToggle", "change si le bot est forcé à être activé (admin)",function(user, userID, channelID, message, rawEvent){return isAdminFunc(userID)}
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!forceDisableToggle" && isAdminFunc(userID)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){

					forceDisable = !forceDisable;

					if (forceDisable) {
						bot.sendMessage({
							to: channelID,
							message: "forceDisable on"
						});
						forceEnable = false;
					}
					else{
						bot.sendMessage({
							to: channelID,
							message: "forceDisable off"
						});
					}
					switchStatusMessage();



				},
				"!forceDisableToggle", "change si le bot est forcé à être désactivé (admin)",function(user, userID, channelID, message, rawEvent){return isAdminFunc(userID)}
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!updateList" && isAdminFunc(userID)){
						return true
					}
					else{
						return false
					}
				},
				function(user, userID, channelID, message, rawEvent){


					bot.sendMessage({
						to: channelID,
						message: "updating list"
					});
					updateUserStatus();
				},
				"!updateList", "update la liste des joueurs (admin)",function(user, userID, channelID, message, rawEvent){return isAdminFunc(userID)}
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!toggleSendData" && isAdminFunc(userID)){
						return true;
					}
					else{
						return false;
					}
				},
				function(user, userID, channelID, message, rawEvent){


					sendData = !sendData;

					if (sendData) {
						bot.sendMessage({
							to: channelID,
							message: "sendData on"
						});

					}
					else{
						bot.sendMessage({
							to: channelID,
							message: "sendData off"
						});
					}
				},
				"!toggleSendData", " (admin)",function(user, userID, channelID, message, rawEvent){return isAdminFunc(userID)}
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					var banRegExp = new RegExp("^!ban *");
					if(banRegExp.test(message) && isModoFunc(userID)){
						return true;
					}
					else{
						return false;
					}
				},
				function(user, userID, channelID, message, rawEvent){

				    banUserCommandManager(user, userID, channelID, message, rawEvent);

				},
				"!ban @name time reason", " (modo)",function(user, userID, channelID, message, rawEvent){return isModoFunc(userID)}
			),
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					var banRegExp = new RegExp("^!unban *");
					if(banRegExp.test(message) && isModoFunc(userID)){
						return true;
					}
					else{
						return false;
					}
				},
				function(user, userID, channelID, message, rawEvent){

					unbanCommandManager(user, userID, channelID, message, rawEvent);

				},
				"!unban @name", " (modo)",function(user, userID, channelID, message, rawEvent){return isModoFunc(userID)}
			),
      new commandC(
       function(user, userID, channelID, message, rawEvent){
         if(message=="!bug"){
           return true
         }
         else{
           return false
         }
       },
       function(user, userID, channelID, message, rawEvent){
         botSendMessageBis(userID,"Pour faire un rapport de bug, allez sur le forum http://asylamba.com/forum/categorie-bug \n\nVous êtes priés d'utiliser ce schéma pour plus de clarté:\nDescription du problème:\nVotre configuration: par exemple: mac/chrome Version 58.0.3029.110 (64-bit)\nnom complet in Game:\nUrgence : par exemple: basse (non bloquant), moyenne (bloquant, mais peux encore jouer), haute (ne peux plus jouer)\nLien sur capture d'écran: vous pouvez utiliser https://ibb.co/ pour héberger vos images");
       },
       "!bug", "Envoi d'un rapport de bug",truefunc
      )

]

commandMaintenance = [
		    new commandC(
				function(user, userID, channelID, message, rawEvent){
					if(message=="!maintenance" && isAdminFunc(userID)){
						return true;
					}
					else{
						return false;
					}
				},
				function(user, userID, channelID, message, rawEvent){

					var arrayUserTemp = [];

					for(var pos=0; pos <userListFaction.length;++pos){
						if (! (parseInt(userListFaction[pos].userID) < 200) ) {
							arrayUserTemp.push(userListFaction[pos]);
						}
					}

					userListFaction = arrayUserTemp;



					bot.sendMessage({
						to: channelID,
						message: "done"
					});

					writeUserList();
					setTimeout(function(){process.exit(0)}, 1000);



				},
				"!maintenance", " (admin) va clear les userID en dessous de 200 (bug) puis stop le bot",function(user, userID, channelID, message, rawEvent){return isAdminFunc(userID)}
			)
]

var commandListAll = commandList.concat(commandManage); // toute les commandes
