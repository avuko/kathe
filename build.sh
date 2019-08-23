#!/usr/bin/env zsh
docker_app='kathe_app'

if docker inspect -f '{{.State.Running}}' "${docker_app}";then
  echo "${docker_app} running"
  docker-compose down
fi
docker build . -t kathe:latest
docker save -o kathe.img kathe
docker image load -i kathe.img
docker-compose up -d
