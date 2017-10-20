ChickenBot
==========

ChickenBot est un bot [Discord](https://discordapp.com/).

Il a été créé dans le but d'interagir avec les joueurs d'un serveur Discord qui regroupe les joueurs d'[Asylamba](http://asylamba.com).

Installation
------------

Il existe désormais deux façons de faire selon votre besoin.

Si vous souhaitez contribuer au développement du bot, vous pouvez tout d'abord cloner le dépôt sur votre machine.

Cependant, si vous souhaitez simplement utiliser le bot, un container Docker a été créé spécialement pour pouvoir consommer directement le bot en tant que webservice.

C'est cette partie qui est détaillée ci-dessous.

### Procédure

Vous pouvez utiliser Docker Compose pour configurer simplement le container.

```yml
services:
  bot:
    container_name: chicken_bot
    image: asylamba/chickenbot
    environment:
      - CHICKENBOT_LOGIN_EMAIL=test@example.org
      - CHICKENBOT_LOGIN_PASSWORD=pswd
      - CHICKENBOT_DISCORD_TOKEN=token
    ports:
      - "8080:80"
```

N'oubliez pas de remplacer les valeurs des variables d'environnement avec vos identifiants.

Vous pouvez ensuite simplement exécuter la commande ```docker-compose up -d```, qui téléchargera l'image et créera le container pour vous.

Pour accéder aux logs du bot, vous pouvez effectuer la commande suivante

```sh
docker logs chicken_bot
```

L'option ``-f``, à placer avant le nom du container, vous permet de suivre les logs interactivement.
