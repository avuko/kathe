#!/usr/bin/env bash
openssl req -newkey rsa:2048 -new -nodes -subj '/O=kathe/CN=localhost/C=EU/OU=kathe' -x509 -days 3650 -keyout ./kathekey.pem -out ./kathecert.pem
