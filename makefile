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
