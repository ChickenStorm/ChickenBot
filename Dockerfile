FROM node:latest
MAINTAINER Kern <kern046@gmail.com>

COPY . /srv/app

RUN npm -g install pm2

EXPOSE 80

CMD ["pm2-docker", "/srv/app/pm2_configuration.yml"]
