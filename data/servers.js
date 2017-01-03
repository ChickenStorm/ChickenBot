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

exports.rootServerId = "132106417703354378"; // le serveru discord sur le quelle opère le bot 
exports.apheraServerId = "265149393638785025" //"168706048004325377";
exports.empireServerId = "168712667253571584";
exports.kovahkServerId= "265128814089076736"//"168710332104048641";
exports.neoServerId= "168715394175991810";
exports.synelleServerId= "265144219088322561"//"168706060230590464";

exports.seldareServerId = "199856052370538496";
exports.cardanServerId = "199856010247143424";
exports.nvnerveServerId = "199855979221876738";
exports.empireServerS11Id = "199855941485723648";

exports.imperServerS12Id = "230273198355251201"
exports.seldareServerS12Id = "230282270202789888";
exports.cardanServerS12Id = "230312943919693824";
exports.neoServerS12Id="230323795733250048";
exports.magoServerS12Id="230328887098343424";


exports.negoreServerId = "265118157469908992";

exports.getServerIdFromFactionColor = function (factionColor){
	if (factionColor ==0 ) {
		return exports.rootServerId;
	}
	else if (factionColor ==1 ) {
		return exports.empireServerS11Id;
	}
	else if (factionColor ==2 ) {
		return exports.kovahkServerId;
	}
	else if (factionColor ==3 ) {
		return exports.negoreServerId;
	}
	else if (factionColor ==6 ) {
		return exports.apheraServerId;
	}
	else if (factionColor ==7 ) {
		return exports.synelleServerId;
	}
	else if (factionColor ==11 ) {
		return exports.neoServerS12Id;
	}
	else if (factionColor == 4) {
		return exports.cardanServerS12Id;
	}
	else if (factionColor == 8) {
		return exports.seldareServerS12Id;
	}
	else if (factionColor == 9) {
		return exports.nvnerveServerId;
	}
	else if (factionColor == 10) {
		return exports.magoServerS12Id;
	}
	else if (factionColor == 12) {
		return exports.imperServerS12Id;
	}
	else{
		return undefined
	}
}

//exports.users = [];
