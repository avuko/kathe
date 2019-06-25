FROM ubuntu:latest

RUN apt-get update \
  && apt-get install -y python3-pip python3-dev libfuzzy-dev \
  && cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 install --upgrade pip

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

ENTRYPOINT ["pipenv"]

ADD kathe.py /
ADD ./web/app.py /web/
ADD ./web/flushcache.py /
ADD ./web/static /web/
ADD Pipfile /
ADD Pipfile.lock /

RUN pip install pipenv
RUN pip install ssdeep
RUN pipenv install --skip-lock
#CMD pipenv shell 
CMD ["run", "/web/app.py"]
