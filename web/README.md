# Installation

Kathe is built around two*) components:

- `kathe.py` a script to create datasets
- `app.py` a GUI to analyse the dataset based via a webgui/API

*) This setup, or at least the regular workflow, will change when we add storing of info to the API.

## Install using docker

Currently, Kathe can be quickly deployed using Docker and Docker-compose. To do use, make sure your system is running Docker and has an internet connection for pulling images. You can then build the Kathe image as follows:

``` cd [this repo] && docker build . -t kathe:latest ```

Verify your freshly built image exists using ```docker image ls``` and start the application using ```docker-compose up -d ```

Navigate to https://[your-docker-host-ip]:8000 

## Manual install (deprecated) 

The GUI is installed as follows:

```bash
apt install uwsgi uwsgi-plugin-python3 python3-bottle nginx python3-pip python3-ssdeep apache2-utils bottle-redis
mkdir /var/www/bottle
```

Create a `/etc/uwsgi/apps-available/bottle.ini ` file:

```ini
[uwsgi]
socket = /run/uwsgi/app/bottle/socket
chdir = /var/www/bottle
master = true
autoload = true
plugins = python3
file = app.py
uid = www-data
gid = www-data
```

 ```bash
ln -s /etc/uwsgi/apps-available/bottle.ini /etc/uwsgi/apps-enabled/bottle.ini
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
openssl dhparam -dsaparam -out /etc/nginx/snippets/ssl-dhparams.pem 2048
sudo htpasswd -c /etc/nginx/snippets/htpasswd my_user 
 ```

Create a `/etc/nginx/conf.d/bottle.conf` file

```conf
upstream _bottle {
    server unix:/run/uwsgi/app/bottle/socket;
}

server {
    auth_basic           "kathe";
    auth_basic_user_file /etc/nginx/snippets/htpasswd;
    listen [::]:80;
    listen 80;
    server_name kathe.your_domain.thingy;
    root /var/www/bottle;

    location / {
        try_files $uri @uwsgi;
    }

    location @uwsgi {
        include uwsgi_params;
        uwsgi_pass _bottle;
    }

    listen 443 ssl; # Self-Generated
ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt; # Self-signed
ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key; # Self-Signed
    include /etc/nginx/snippets/options-ssl-nginx.conf; # copied from Letsencrypt
    ssl_dhparam /etc/nginx/snippets/ssl-dhparams.pem; # Self-Generated


    if ($scheme != "https") {
        return 301 https://$host$request_uri;
    } # Self-Generated

}
```

create `/etc/nginx/snippets/options-ssl-nginx.conf`:

```conf
ssl_session_cache shared:le_nginx_SSL:1m;
ssl_session_timeout 1440m;

ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
ssl_prefer_server_ciphers on;

ssl_ciphers "ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA256:DHE-RSA-AES256-SHA:ECDHE-ECDSA-DES-CBC3-SHA:ECDHE-RSA-DES-CBC3-SHA:EDH-RSA-DES-CBC3-SHA:AES128-GCM-SHA256:AES256-GCM-SHA384:AES128-SHA256:AES256-SHA256:AES128-SHA:AES256-SHA:DES-CBC3-SHA:!DSS";
```



store the content of `web/*` into /var/www/bottle/

Currently I'm not using bottle-redis, this might change in the future.

## Filling the database

I'm using `malpedia.py` to load malpedia information into the dataset. I've received a very large set of meta-info from Hybrid Analysis, so that is loaded as well using `kathe.py`'s csv function.

## Cleaning the cache

`flushcache.py` is a quick and dirty tool to delete all the cached sets etc. from the db. Further optimization would be to auto-delete all caches with other than current timestamps. This is a `TODO`. 
