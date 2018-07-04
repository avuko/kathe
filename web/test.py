#!/usr/bin/env python3
# XXX testing
import json
import math
import redis
REDISDB = 1
rdb = redis.StrictRedis(host='localhost', db=REDISDB, decode_responses=True)

print(rdb.zrank('names:context', 'blaat'))
