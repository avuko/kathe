#!/usr/bin/env bash 
docker_app='kathe_app'

if docker inspect -f '{{.State.Running}}' "${docker_app}";then
  echo "${docker_app} running"
  docker-compose down
fi
if [ ! -f conf/cert/kathecert.pem ]; then
  echo "Generating new kathe SSL cert..."
  openssl req -newkey rsa:2048 -new -nodes -subj '/O=kathe/CN=localhost/C=EU/OU=kathe' -x509 -days 3650 -keyout conf/cert/kathekey.pem -out conf/cert/kathecert.pem
else
  echo "kathe SSL cert exists, skipping creation..."
fi

docker build . -t kathe:latest
docker save -o kathe.img kathe
docker image load -i kathe.img
docker-compose up
