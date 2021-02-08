#!/usr/bin/env python3
KATHE_HOST = '0.0.0.0'
KATHE_PORT = 8000
REDIS_DB = 13
REDIS_HOST = '127.0.0.1'
REDIS_PASS = 'redis'

SORTED_SET_LIMIT = 256
CONTEXT_SET_LIMIT = 2000


# data sources of analysed binaries, used under /info/ by app.py:
DATA_SOURCES = {'hybridanalysis': 'https://www.hybrid-analysis.com/sample/',
                'malpedia': 'https://malpedia.caad.fkie.fraunhofer.de/#',
                'virustotal': 'https://www.virustotal.com/#/file/'}
