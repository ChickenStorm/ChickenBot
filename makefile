OBJ_FILES = bot.js makefileC data/user.js data/channel.js;

all: updateThenRun

update: 
	wget "https://github.com/ChickenStorm/ChickenBot/archive/master.zip";
	unzip master.zip;
	rm master.zip;
	cp ChickenBot-master/bot.js bot.js;
	cp ChickenBot-master/PendingOperation.js PendingOperation.js;
	cp ChickenBot-master/data/user.js ./data/user.js;
	cp ChickenBot-master/data/channel.js ./data/channel.js;
	cp ChickenBot-master/data/role.js ./data/role.js;
	cp ChickenBot-master/data/texts-facts.js ./data/texts-facts.js
	cp ChickenBot-master/data/servers.js ./data/servers.js 
	cp ChickenBot-master/makefile makefile;
	cp ChickenBot-master/run.sh run.sh;
	cp ChickenBot-master/runLoop.sh runLoop.sh;
	cp ChickenBot-master/simulateur/Asylamba_project_bot_launcher.html ./simulateur/Asylamba_project_bot_launcher.html;
	cp ChickenBot-master/simulateur/Asylamba_Project_Script.js ./simulateur/Asylamba_Project_Script.js;
	cp ChickenBot-master/simulateur/ChickenStorm.js ./simulateur/ChickenStorm.js;
	cp ChickenBot-master/simulateur/cookies_save.js ./simulateur/cookies_save.js;
	cp ChickenBot-master/simulateur/Html_page_text.js ./simulateur/Html_page_text.js;
	cp ChickenBot-master/simulateur/simulateur_graphique.js ./simulateur/simulateur_graphique.js;
	cp ChickenBot-master/simulateur/simulation_asylamba.js ./simulateur/simulation_asylamba.js;
	cp ChickenBot-master/simulateur/url_related_usage.js ./simulateur/url_related_usage.js;
	rm -r http-page;
	cp -r ChickenBot-master/http-page http-page;
	rm -r ChickenBot-master;
	

updateLib:
	npm install discord.io
	npm install basic-auth
	npm install --save circular-json
updateAll: updateLib update

run :
	sh run.sh
	
runLoop: 
	sh runLoop.sh

updateThenRun: update run

updateThenRunLoop: update runLoop


updateAllThenRun: updateAll run
