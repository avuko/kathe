#!/usr/bin/env python3
from optparse import OptionParser
import hashlib
import json
import os
import re
import redis
import secrets
import ssdeep
import sys
import time
import requests

# You might need a secrets.py in this directory with api keys

parser = OptionParser()
parser.add_option("-c", "--context", dest="context", action='store',
                  type='string',
                  help="Always add context. E.g.: \"spam\" or \"honeydrops\"",
                  metavar="REQUIRED")
parser.add_option("-r", "--redisdb", dest="redisdb", action='store',
                  type='int',
                  help="select the redisdb #. to store in. defaults to 0",
                  metavar="0")
parser.add_option("-f", "--file", dest="filename", action='store',
                  type='string',  help="analyse a file.", metavar="FILE")
parser.add_option("-t", "--virustotal", dest="virustotal", action='store',
                  help="use hybrid-analysis to use virustotal as a source",
                  metavar="file of hybrid-analysis feed in json output")
parser.add_option("-j", "--json", dest="jason", action='store', type='string',
                  help="""use json formatted strings as source:
                  ["ssdeephash","some string","sha256"]
                  cat json|while read line; do ./kathe.py -j "${line}";done""",
                  metavar="JSON input")
parser.add_option("-v", "--verbose", action="store_true", help="print results")

(options, args) = parser.parse_args()


# Ugly way to check you are actually giving us to work
# with.
if options.filename is None and options.virustotal is None\
 and options.jason is None or options.context is None:
    print(parser.error("Missing options, see " + sys.argv[0] + " -h"))


# To start with, set all to None.
filename = None
filessdeep = None
filesha256 = None

# By default, store in Redis db 0.
if options.redisdb:
    redisdbnr = options.redisdb
else:
    redisdbnr = 0

# Connect to redis.
# Also, convert all responses to strings, not bytes
r = redis.StrictRedis('localhost', 6379, db=redisdbnr, charset="utf-8",
                      decode_responses=True)


def cleancontext(contextstring):
    """Remove all but 0-9 and a-z from the context option.
    We need to do this to make splitting the strings by
    other tools reliable."""
    pattern = re.compile('[\W_]+')
    cleancontextstring = pattern.sub('', contextstring)
    return cleancontextstring


# Making sure the context string doesn't ruin a perfectly
# beautiful string. Also, last ditch protection with NONE.
if options.context:
    filecontext = cleancontext(options.context)
else:
    filecontext = 'NONE'


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
    return without filessdeep."""
    siblings_set = r.smembers(rolling_window_ssdeep)
    siblings_set.discard(filessdeep)
    return siblings_set


def add_ssdeep_to_rolling_window(rolling_window_ssdeep, filessdeep):
    """This function adds the filessdeep hash to all the matching
    rolling_windows."""
    r.sadd(rolling_window_ssdeep, filessdeep)


def add_info(filename, filesha256, filessdeep, context):
    """The four info fields contain a set (read: unique) of information
    about the added entity. This way sha256/filename/filessdeep are
    linked and retrievable."""
    r.sadd('info:filename:{}'.format(filename),
           'sha256:{}:ssdeep:{}:context:{}'.format(filesha256,
                                                   filessdeep,
                                                   filecontext))
    r.sadd('info:context:{}'.format(filecontext),
           'sha256:{}:ssdeep:{}:filename:{}'.format(filesha256,
                                                    filessdeep,
                                                    filename))
    r.sadd('info:ssdeep:{}'.format(filessdeep),
           'sha256:{}:context:{}:filename:{}'.format(filesha256,
                                                     filecontext,
                                                     filename))
    r.sadd('info:sha256:{}'.format(filesha256),
           'ssdeep:{}:context:{}:filename:{}'.format(filessdeep,
                                                     filecontext,
                                                     filename))
    r.sadd("hashes:ssdeep", '{}'.format(filessdeep))
    r.sadd("names:filename", '{}'.format(filename))
    r.sadd("names:context", '{}'.format(filecontext))


def get_allsha256_for_ssdeep(ssdeep):
    """function which retrieves a string of unique sha256 hashes for
    an ssdeep hash. Theoretically a single ssdeep hash could match multiple
    different files, if the differences are insignificant."""
    allsha256 = [allsha256.split(':')[1]
                 for allsha256 in r.smembers('info:ssdeep:{}'.format(ssdeep))]
    allsha256 = str.join(':', set(allsha256))
    return allsha256


def return_results(filename, filesha256, filessdeep, filecontext):
    """The results should be in json. But the json.dumps function
    cannot deal with python sets, so we turn them into lists.
    additionally we retrieve other files with the same sha256 and,
    last but not least, it siblings (partially matching ssdeep hashes)."""
    info = dict()
    info['filename'] = filename
    info['sha256'] = filesha256
    info['ssdeep'] = filessdeep
    info['context'] = filecontext
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


# use virustotal as as resource
def vtgetinfo(apikey, resourcehash):
    """ We can add virustotal info (I have requested ssdeep info in the api) into
    our dataset. I don't have a private API, so I'm getting the hashes from
    hybrid-analysis.com (which does allow us to get a feed of a number of days
    back) and use their hashes as the input to query virustotal."""
    print("waiting 15 seconds")
    time.sleep(15)
    print('getting info on {}'.format(resourcehash))
    params = {'apikey': apikey, 'resource': resourcehash}
    headers = {"Accept-Encoding": "gzip, deflate",
               "User-Agent": "gzip, avuko"}
    response = requests.get('https://www.virustotal.com/vtapi/v2/file/report?allinfo=true',
                            params=params, headers=headers)
    json_response = response.json()
    return json_response


def vtgetdetails(apikey, json_response):
    if json_response['response_code'] is 1:
        jason = json_response
        for key in jason:
            if str(key) == 'ssdeep':
                if str(key) == 'submitname':
                    details = (json.dumps(jason[u'submitname']),
                               jason[u'sha256'], jason[u'ssdeep'])
                else:
                    details = (jason[u'md5'],
                               jason[u'sha256'], jason[u'ssdeep'])
                return(details)


def addssdeeptodb(filename, filesha256, filessdeep, filecontext):
    # If the file is new, add all information
    if newhash(filesha256):
        filename = cleanname(filename)
        add_info(filename, filesha256, filessdeep, filecontext)
        ssdeep_compare = preprocess_ssdeep(filessdeep)
        for rolling_window_ssdeep in ssdeep_compare:
            ssdeep_sets = get_ssdeep_sets(rolling_window_ssdeep, filessdeep)
            add_ssdeep_to_rolling_window(rolling_window_ssdeep, filessdeep)
            for sibling_ssdeep in ssdeep_sets:
                # Add sibling_ssdeep to the filessdeep
                r.zadd(filessdeep,
                       float(ssdeep.compare(sibling_ssdeep, filessdeep)),
                       '{},{}'.format(sibling_ssdeep,
                                      get_allsha256_for_ssdeep(sibling_ssdeep)))
                # Add filessdeep to sibling_ssdeep
                r.zadd(sibling_ssdeep,
                       float(ssdeep.compare(filessdeep, sibling_ssdeep)),
                       '{},{}'.format(filessdeep,
                                      filesha256))

    # or else, add only the new info
    else:
        filename = cleanname(filename)
        add_info(filename, filesha256, filessdeep, filecontext)

    # return the result in json format if verbose is set
    if options.verbose:
        print(json.dumps(return_results(filename, filesha256,
                                        filessdeep, filecontext),
              indent=4, sort_keys=True))

# below we will have to do different things
# depending on whether we load info,
# or have to generate the info ourselves.


# call functions to get hashes
if options.filename:
    filename = options.filename
    filesha256 = file_sha256('{}'.format(filename))
    filessdeep = file_ssdeep('{}'.format(filename))
    addssdeeptodb(filename, filesha256, filessdeep, filecontext)

elif options.virustotal:
    apikey = secrets.vt
    with open(options.virustotal) as jsonfile:
        jsonload = jsonfile.read()
    jsondays = json.loads(jsonload)
    jsondata = jsondays['data']
    for resourcehash in jsondata[:]:
        jsonresponse = vtgetinfo(apikey, resourcehash['sha256'])
        details = vtgetdetails(apikey, jsonresponse)
        if details:
            print(details)
            filename = details[0]
            filesha256 = details[1]
            filessdeep = details[2]
            if filessdeep:
                addssdeeptodb(filename, filesha256, filessdeep, filecontext)

elif options.jason:
    jasoninfo = json.loads(options.jason)
    filessdeep = jasoninfo[0]
    filename = jasoninfo[1]
    filesha256 = jasoninfo[2]
    addssdeeptodb(filename, filesha256, filessdeep, filecontext)
