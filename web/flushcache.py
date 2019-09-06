#!/usr/bin/env python3
import redis
import defaults
import sys
try:
    REDISDB = sys.argv[1]
except IndexError:
    # print('flushing db 13')
    # REDISDB = 13
    print('give a redis db number to flush')
    exit()
rdb = redis.StrictRedis(password=defaults.REDIS_PASS, host='localhost', db=REDISDB, decode_responses=True)

cachemembers = rdb.smembers('cachecontrol')
for cache in cachemembers:
    print(cache)
    cachesplit = cache.split(':')
    cachenode = cachesplit[:]
    cachenode.insert(len(cachenode) - 1, 'nodes')
    cachelink = cachesplit[:]
    cachelink.insert(len(cachelink) - 1, 'links')
    cachecontexts = cachesplit[:]
    cachecontexts.insert(len(cachecontexts) - 1, 'contexts')
    cachejson = cachesplit[:]
    cachejson.insert(len(cachejson) - 1, 'json')

    rdb.delete(':'.join(cachenode))
    print('flushed {}'.format(cachenode))
    rdb.delete(':'.join(cachelink))
    print('flushed {}'.format(cachelink))
    rdb.delete(':'.join(cachecontexts))
    print('flushed {}'.format(cachecontexts))
    rdb.delete(':'.join(cachejson))
    print('flushed {}'.format(cachejson))
    rdb.delete(':'.join(cachesplit))
    rdb.srem('cachecontrol', ':'.join(cachesplit))
