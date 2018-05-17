#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from optparse import OptionParser
import hashlib
import json
import os
import redis
import secrets
import ssdeep
import sys
import time
import requests
import csv
from datetime import datetime
import unicodedata

# You might need a secrets.py in this directory with api keys

parser = OptionParser()
parser.add_option("-c", "--context", dest="context", action='store',
                  type='string',
                  help="context (comma separated).  E.g.: 'win.isfb,malpedia,2018-01-01'\nMake sure the most important context (in this example the malware family)\nis the first one in the list.",
                  metavar="REQUIRED")
parser.add_option("-r", "--redisdb", dest="redisdb", action="store",
                  type='int',
                  help='select the redisdb #. to store in. defaults to 14',
                  metavar="14")
parser.add_option("-f", "--file", dest="filename", action='store',
                  type='string',  help="analyse a file.", metavar="FILE")
parser.add_option("-i", "--csv", dest="csvfile", action='store',
                  type='string',  help="import a csv", metavar="FILE")
parser.add_option("-j", "--json", dest="jason", action='store', type='string',
                  help="""use json formatted strings (per line) as source:
                  ["ssdeephash","identifying name","sha256"]
                  cat json|while read line; do ./kathe.py -j "${line}";done""",
                  metavar="JSON input")
parser.add_option("-v", "--verbose", action="store_true", help="print results")

(options, args) = parser.parse_args()


# Ugly way to check you are actually giving us to work
# with.
if options.filename is None and options.jason is None\
 and options.csvfile is None or options.context is None:
    print(parser.error("Missing options, see " + sys.argv[0] + " -h"))


# To start with, set all to None.
filename = None
filessdeep = None
filesha256 = None

# By default, store in Redis db 14.
if options.redisdb:
    redisdbnr = options.redisdb
else:
    redisdbnr = 14

# Connect to redis.
# Also, convert all responses to strings, not bytes
r = redis.StrictRedis('localhost', 6379, db=redisdbnr, charset="utf-8",
                      decode_responses=True)


def timestamp():
    ts = int(datetime.now().strftime("%s")+str(datetime.now().microsecond))
    yield ts


def blacklist_chars(inputstring):
    inputstring.replace(':', '').replace('\\', '').replace('"', '')
    inputstring.replace('\'', '').replace('|', '').replace(' ', '')
    return inputstring

def remove_control_characters(s):
    return "".join(ch for ch in s if unicodedata.category(ch)[0]!="C")

def cleancontext(contextstring):
    """Remove all troublesome characters from the context option.
    We need to do this to make splitting the strings by
    other tools reliable."""
    cleancontextstring = contextstring.replace(':', '').replace('\\', '').replace('"', '').replace('\'', '').replace('|', '').replace(' ', '')
    # make string splitable on pipe symbol and turn to lowercase
    cleancontextstring = cleancontextstring.encode('utf-8', 'ignore').decode('utf-8', 'ignore')
    cleancontextstring = cleancontextstring.replace(',', '|').lower()
    cleancontextstring = remove_control_characters(cleancontextstring)
    return cleancontextstring


# Making sure the context string doesn't destroy a perfectly
# beautiful string. Also, last ditch protection with NONE.
if options.context:
    filecontext = options.context
else:
    filecontext = 'NONE'



def cleanname(filename):
    """Remove pathname from the input and characters
    which could cause issues with stringparsing.
    Stringing together '.replace' seems the fastest way
    to do this: https://stackoverflow.com/a/27086669"""
    # XXX in the case of directories, we'd want dirnames etc.
    cleanname = os.path.basename(filename)
    cleanname = cleanname.replace(':', '').replace('\\', '').replace('"', '').replace('\'', '').replace('|', '').replace(' ', '')
    cleanname = cleanname.encode('utf-8', 'ignore').decode('utf-8', 'ignore')
    cleanname = remove_control_characters(cleanname)
    cleanname = cleanname.replace(',', '|').lower()
    cleanname = cleanname.replace(',', '').lower()
    return (cleanname)


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


def add_info(filename, filesha256, filessdeep, filecontext):
    """The four info fields contain a set (read: unique) of information
    about the added entity. This way sha256/filename/filessdeep are
    linked and retrievable."""
    filecontext = cleancontext(filecontext)
    splitcontext = filecontext.split('|')

    r.sadd('info:filename:{}'.format(filename),
           'sha256:{}:ssdeep:{}:context:{}'.format(filesha256,
                                                   filessdeep,
                                                   filecontext))
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
    for singlecontext in splitcontext:
        r.sadd("names:context", '{}'.format(singlecontext))
        r.sadd('info:context:{}'.format(singlecontext),
               'sha256:{}:ssdeep:{}:filename:{}:filecontext:{}'.format(filesha256,
                                                                       filessdeep,
                                                                       filename,
                                                                       filecontext))
    r.set("timestamp", timestamp())


def get_allsha256_for_ssdeep(ssdeep):
    """function which retrieves a string of unique sha256 hashes for
    an ssdeep hash. Theoretically a single ssdeep hash could match multiple
    different files, if the differences are insignificant."""
    allsha256s = [allsha256.split(':')[1]
                  for allsha256 in r.smembers('info:ssdeep:{}'.format(ssdeep))]
    allsha256s = str.join(':', set(allsha256s))
    # print(allsha256s)
    return allsha256s


def get_allcontext_for_ssdeep(ssdeep):
    """function which retrieves a string of unique context strings for
    an ssdeep hash. Theoretically a single ssdeep hash could match multiple
    different contexts, based on how they are added to the dataset."""
    allcontexts = [allcontext.split(':')[3]
                   for allcontext in r.smembers('info:ssdeep:{}'.format(ssdeep))]
    allcontexts = str.join(':', set(allcontexts))
    # print(allcontexts)
    return allcontexts


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
                       '{},{},{}'.format(sibling_ssdeep,
                                         get_allsha256_for_ssdeep(sibling_ssdeep),
                                         get_allcontext_for_ssdeep(sibling_ssdeep)))
                # Add filessdeep to sibling_ssdeep
                r.zadd(sibling_ssdeep,
                       float(ssdeep.compare(filessdeep, sibling_ssdeep)),
                       '{},{},{}'.format(filessdeep,
                                         filesha256, filecontext.replace(',','|')))

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

# elif options.virustotal:
#     apikey = secrets.vt
#     with open(options.virustotal) as jsonfile:
#         jsonload = jsonfile.read()
#     jsondays = json.loads(jsonload)
#     jsondata = jsondays['data']
#     for resourcehash in jsondata[:]:
#         jsonresponse = vtgetinfo(apikey, resourcehash['sha256'])
#         details = vtgetdetails(apikey, jsonresponse)
#         if details:
#             # print(details)
#             filename = details[0]
#             filesha256 = details[1]
#             filessdeep = details[2]
#             if filessdeep:
#                 addssdeeptodb(filename, filesha256, filessdeep, filecontext)

elif options.jason:
    jasonstring = options.jason
    print(jasonstring)
    jasoninfo = json.loads(jasonstring)
    filessdeep = jasoninfo[0]
    filename = jasoninfo[1]
    filesha256 = jasoninfo[2]
    addssdeeptodb(filename, filesha256, filessdeep, filecontext)

elif options.csvfile:
    csvfile = options.csvfile
    with open(csvfile) as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            csvcontext = []
            if row['ssdeep'] and row['sha256']:
                if row['filename'] is '':
                    row['filename'] = row['sha256']
                elif row['context0'] is '':
                    row['context0'] = 'unknown_type'
                    csvcontext.append(cleancontext(row['context0']))
                elif row['context1'] is not '':
                    csvcontext[0:0] = [cleancontext(row['context1'])]
                clicontexts = cleancontext(options.context).split('|')
                for clicontext in clicontexts:
                    if clicontext is not '':
                        csvcontext.append(clicontext)
                #print(csvcontext)
                # filecontext = ','(csvcontext)
                # addssdeeptodb(cleanname(row['filename']), row['sha256'], row['ssdeep'], filecontext)
                print(cleanname(row['filename']), row['sha256'], row['ssdeep'], '|'.join(csvcontext))
