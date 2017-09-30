#!/usr/bin/env python3
import sys
import os
import redis
import ssdeep
import hashlib
import json
import secrets
from datetime import datetime as dt
from optparse import OptionParser


parser = OptionParser()
# parser.add_option("-c", "--context", dest="context", action='store',
#                  type='string',
#                  help="is it known malware (y=/n/?)",
#                  metavar="<y|n|?>")
parser.add_option("-r", "--redisdb", dest="redisdb", action='store',
                  type='int',
                  help="select the redisdb #. to store in. defaults to 0",
                  metavar="0")
parser.add_option("-f", "--file", dest="filename", action='store',
                  type='string',  help="analyse a file.", metavar="FILE")
parser.add_option("-t", "--virustotal", dest="virustotal", action='store',
                  type='string', help="use virustotal as a source.",
                  metavar="virustotal output")
parser.add_option("-j", "--json", dest="jason", action='store', type='string',
                  help="""use json formatted strings s a source:
                  ["ssdeephash","some string","sha256"]
                  cat json|while read line; do ./kathe.py -j "${line}";done""",
                  metavar="jason input")
# parser.add_option("-v", "--verbose",
#                  default=False,
#                  help="print results")

(options, args) = parser.parse_args()


# ugly
if options.filename is None and options.virustotal is None\
 and options.jason is None:
    print(parser.error("Missing options, see " + sys.argv[0] + " -h"))

# if options.verbose:
# XXX debug test file
# contains spaces
filename = None

# By default, store in Redis db 0
if options.redisdb:
    redisdbnr = options.redisdb
else:
    redisdbnr = 0

# if not options.context:
#    print('you forgot to add context with "-c" <y(es), n(o), ?(dunno)>')
#    exit(1)

# elif options.context.lower() in ['y', 'n', 'u']:
#    malware = options.context
# else:
#    malware = options.context
#    print('context option "-c {}" not one of "y(es)", "n(o)",\
# "u(nknown)"'.format(malware))
#    exit(1)

# connect to redis
# r = redis.Redis('localhost')
# convert all responses to strings, not bytes
r = redis.StrictRedis('localhost', 6379, charset="utf-8",
                      decode_responses=True)
# XXX debug flushall to trigger parsing
# r.flushall()


def cleanname(filename):
    """Remove pathname from the input and characters
    which could cause issues with stringparsing.
    Stringing together '.replace' seems the fastest way
    to do this: https://stackoverflow.com/a/27086669"""
    cleanname = os.path.basename(filename)
    cleanname = cleanname.replace(':', '').replace('\\', '').replace('"', '')
    return cleanname


# buffered file reading sha256
def file_sha256(filename):
    """returns the sha256 hash of a file buffered,
    so memory isn't swamped when dealing with large files."""
    h = hashlib.sha256()
    with open(filename, 'rb', buffering=0) as f:
        for b in iter(lambda: f.read(128*1024), b''):
            h.update(b)
    return h.hexdigest()


# buffered file reading ssdeep
def file_ssdeep(filename):
    """returns the ssdeep hash of a file buffered,
    so memory isn't swamped when dealing with large files."""
    h = ssdeep.Hash()
    with open(filename, 'rb', buffering=0) as f:
        for b in iter(lambda: f.read(128*1024), b''):
            h.update(b)
    return h.digest()


# The below two functions (preprocess_ssdeep and get_all_7_char_rolling_window)
# originally come from Brian Wallace:
# https://www.virusbulletin.com/virusbulletin/2015/11/optimizing-ssdeep-use-scale

def get_all_7_char_rolling_window(bs, h):
    """return a set containing the 7 character length strings (rolling window)
    of the ssdeep string for both block sizes, with the block size prepended.
    Ssdeep only does a compare if at least 7 characters match between strings.
    These are the keys which hold the sibling values."""
    return set((str(bs) + ":" + h[i:i+7]) for i in range(len(h) - 6))


def preprocess_ssdeep(h):
    """The ssdeep string is split into block_size, ssdeep, ssdeep_double_block.
    Before returning a set of all the rolling_window for size and double size,
    all the repeated character sequences of more than 3 are reduced to max 3.
    This is something the ssdeep algoritm does internally too.
    """
    h_rolling_window = set()
    block_size, h = h.split(":", 1)
    block_size = int(block_size)
    # Reduce any sequence of the same char greater than 3 to 3
    for c in set(list(h)):
        while c * 4 in h:
            h = h.replace(c * 4, c * 3)
    block_data, double_block_data = h.split(":")
    h_rolling_window.update(get_all_7_char_rolling_window(block_size,
                                                          block_data))
    h_rolling_window.update(get_all_7_char_rolling_window(block_size * 2,
                                                          double_block_data))
    return h_rolling_window


def get_ssdeep_sets(rolling_window_ssdeep, filessdeep):
    """ create a set of ssdeep hashes matching filesssdeep
    from the rolling_window set, which does not contain
    filessdeep hash itself. Using '.discard' to silently
    return without filessdeep itself."""
    siblings_set = r.smembers(rolling_window_ssdeep)
    siblings_set.discard(filessdeep)
    return siblings_set


def add_ssdeep_to_rolling_window(rolling_window_ssdeep, filessdeep):
    """This function adds the filessdeep hash to all the matching
    rolling_window."""
    r.sadd(rolling_window_ssdeep, filessdeep)


def add_info(filename, filesha256, filessdeep):
    """the three info fields contain a set (hence: unique) of information
    about the added entity. This way sha256<>filename<>filessdeep are
    linked and retrievable."""
    r.sadd('info:filename:{}'.format(filename),
           'sha256:{}:ssdeep:{}'.format(filesha256, filessdeep))
    r.sadd('info:ssdeep:{}'.format(filessdeep),
           'sha256:{}:filename:{}'.format(filesha256, filename))
    r.sadd('info:sha256:{}'.format(filesha256),
           'ssdeep:{}:filename:{}'.format(filessdeep, filename))
    r.sadd("hashes:ssdeep", '{}'.format(filessdeep))
    r.sadd("names:filename", '{}'.format(filename))


def get_allsha256_for_ssdeep(ssdeep):
    """function which retrieves a string of unique sha256 hashes for
    an ssdeep hash. Theoretically a single ssdeep hash could match multiple
    different files, if the differences are insignificant."""
    allsha256 = [allsha256.split(':')[1]
                 for allsha256 in r.smembers('info:ssdeep:{}'.format(ssdeep))]
    allsha256 = str.join(':', set(allsha256))
    return allsha256


def return_results(filename, filesha256, filessdeep):
    """The results should be in json. But the json.dumps function
    cannot deal with python sets, so we turn them into lists.
    additionally we retrieve other files with the same sha256 and,
    last but not least, it siblings (partially matching ssdeep hashes)."""
    info = dict()
    info['filename'] = filename
    info['sha256'] = filesha256
    info['ssdeep'] = filessdeep
    info['other_filenames'] = [filenames.split(':')[-1]
                               for filenames in
                               r.smembers('info:sha256:{}'.format(filesha256))
                               if filenames.split(':')[-1] not in filename]
    info['siblings'] = list(r.zrangebyscore(filessdeep, min=0,
                            max='+inf', withscores=True))
    return(info)


def newhash(filesha256):
    """ To speed things up, we take a different path if the file is already known.
    return True if new, False if the hash is already known."""
    if r.sadd("hashes:sha256", '{}'.format(filesha256)):
        new = True
    else:
        new = False
    return new


# below we will have to do different things, depending on whether we load info,
# or have to generate the info ourselves.

# call functions to get hashes
if options.filename:
    filename = options.filename
    filesha256 = file_sha256('{}'.format(filename))
    filessdeep = file_ssdeep('{}'.format(filename))
    mtimestamp = dt.fromtimestamp(os.path.getmtime(filename)).isoformat()
elif options.virustotal:
    apikey = secrets.vt

elif options.jason:
    jasoninfo = json.loads(options.jason)
    # print('filessdeep: ' + jasoninfo[0])
    filessdeep = jasoninfo[0]
    filename = jasoninfo[1]
    # print('filename: ' + filename)
    # print('filesha256: ' + jasoninfo[2])
    filesha256 = jasoninfo[2]


# XXX debug
# print(filename)
# print(filesha256)
# print(filessdeep)
# print(r.smembers('hashes:sha256'))


# If the file is new, add all information
# TODO The final zadd adds '"' to the sha256 hashes from
# get_allsha256_for_ssdeep. This is a bug
if newhash(filesha256):
    filename = cleanname(filename)
    add_info(filename, filesha256, filessdeep)
    ssdeep_compare = preprocess_ssdeep(filessdeep)
    for rolling_window_ssdeep in ssdeep_compare:
        ssdeep_sets = get_ssdeep_sets(rolling_window_ssdeep, filessdeep)
        add_ssdeep_to_rolling_window(rolling_window_ssdeep, filessdeep)
        for sibling_ssdeep in ssdeep_sets:
            r.zadd(filessdeep,
                   float(ssdeep.compare(sibling_ssdeep, filessdeep)),
                   '{},"{}"'.format(sibling_ssdeep,
                                    get_allsha256_for_ssdeep(sibling_ssdeep)))

# or else, add only the new info
else:
    filename = cleanname(filename)
    add_info(filename, filesha256, filessdeep)


# return the result in json format if -v
# if options.verbose:
#    print(json.dumps(return_results(filename, filesha256, filessdeep),
#          indent=4, sort_keys=True))
