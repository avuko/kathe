#!/usr/bin/env python3
import redis
REDISDB = 13
rdb = redis.StrictRedis(host='localhost', db=REDISDB, decode_responses=True)

cachemembers = rdb.smembers('cachecontrol')
for cache in cachemembers:
    cachesplit = cache.split(':')
    cachenode = cachesplit[:]
    cachenode.insert(len(cachenode)-1, 'nodes')
    cachelink = cachesplit[:]
    cachelink.insert(len(cachelink)-1, 'links')

    rdb.delete(':'.join(cachenode))
    rdb.delete(':'.join(cachelink))
    rdb.delete(':'.join(cachesplit))
    rdb.srem('cachecontrol', ':'.join(cachesplit))
