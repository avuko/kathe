#!/usr/bin/env python3
# -*- coding: utf-8 -*-
""" This module is meant to be used together with the web app.
For the stand alone CLI implementation, see parent directory.
"""
from datetime import datetime
# import json
import os
import re
import unicodedata
import logging
import defaults

logger = logging.getLogger()

try:
    import redis
except ImportError:
    print('pip install redis')
    exit(1)
try:
    import ssdeep
except ImportError:
    """
    if you get errors during the installation process, install these:
    sudo apt-get install python3 python-dev python3-dev build-essential libssl-dev
    libffi-dev libxml2-dev libxslt1-dev zlib1g-dev python-pip libfuzzy-dev
    """
    print('pip install ssdeep')
    exit(1)


# To start with, set all to None.
inputname = None
inputssdeep = None
inputsha256 = None

# set the DB number and host to the default value
REDIS_DB = defaults.REDIS_DB
REDIS_HOST = defaults.REDIS_HOST

# Connect to redis.
# Also, convert all responses to strings, not bytes
r = redis.StrictRedis(REDIS_HOST, 6379, db=REDIS_DB, charset="utf-8",
                      decode_responses=True)


def timestamp():
    ts = int(datetime.now().strftime("%s") + str(datetime.now().microsecond))
    return ts


def check_sha256(sha256_string):
    sha256check = re.compile(r"^[a-f0-9]{64}(:.+)?$", re.IGNORECASE)
    result = bool(sha256check.match(sha256_string))
    return result


def check_ssdeep(ssdeep_string):
    ssdeepcheck = re.compile(r"^[0-9]*\:[a-z0-9+/]*\:[a-z0-9+/]*$", re.IGNORECASE)
    result = bool(ssdeepcheck.match(ssdeep_string))
    return result


def remove_control_characters(s):
    """Some input (like filenames) has some really nasty control chars.
    This trick removes those (https://stackoverflow.com/a/19016117)"""
    return "".join(ch for ch in s if unicodedata.category(ch)[0] != "C")


def replace_badchars(inputstring):
    """Stringing together '.replace' seems the fastest way
    to do this: https://stackoverflow.com/a/27086669.
    As the input is json, the "," does not nead special treatment
    """
    blacklist = {':': '', '\\': '', '"': '', '\'': '', '|': '',
                 ' ': '', '/': ''}
    for k in blacklist:
        inputstring = inputstring.replace(k, blacklist[k])
    return inputstring


def clean_context(contextstring):
    """Remove all troublesome characters from the context option.
    We need to do this to make splitting the strings by
    other tools reliable."""
    clean_contextstring = replace_badchars(contextstring)
    # make string splitable on pipe symbol and turn to lowercase
    clean_contextstring = clean_contextstring.encode('utf-8', 'ignore')
    clean_contextstring = clean_contextstring.decode('utf-8', 'ignore')
    clean_contextstring = clean_contextstring.replace(',', '|').lower()
    clean_contextstring = remove_control_characters(clean_contextstring)
    return clean_contextstring


def clean_name(filename):
    """Remove pathname from the input and characters
    which could cause issues with stringparsing.
    """
    # XXX in the case of directories, we'd want dirnames etc.
    cleanname = os.path.basename(filename)
    cleanname = replace_badchars(cleanname)
    cleanname = cleanname.encode('utf-8', 'ignore').decode('utf-8', 'ignore')
    cleanname = remove_control_characters(cleanname)
    # this turns a comma seperated list into the actual context list
    cleanname = cleanname.replace(',', '|').lower()
    return (cleanname)


# The below two functions (preprocess_ssdeep and get_all_7_char_rolling_window)
# originally come from Brian Wallace:
# https://www.virusbulletin.com/virusbulletin/2015/11/\
#        optimizing-ssdeep-use-scale

def get_all_7_char_rolling_window(bs, h):
    """return a set containing the 7 character length strings (rolling window)
    of the ssdeep string for both block sizes, with the block size prepended.
    Ssdeep only does a compare if at least 7 characters match between strings.
    These are the keys which hold the sibling values."""
    return set((str(bs) + ":" + h[i:i + 7]) for i in range(len(h) - 6))


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


def get_ssdeep_sets(rolling_window_ssdeep, inputssdeep):
    """ create a set of ssdeep hashes matching filesssdeep
    from the rolling_window set, which does not contain
    inputssdeep hash itself. Using '.discard' to silently
    return without inputssdeep."""
    siblings_set = r.smembers(rolling_window_ssdeep)
    siblings_set.discard(inputssdeep)
    return siblings_set


def add_ssdeep_to_rolling_window(rolling_window_ssdeep, inputssdeep):
    """This function adds the inputssdeep hash to all the matching
    rolling_windows."""
    r.sadd(rolling_window_ssdeep, inputssdeep)


def add_info(inputname, inputsha256, inputssdeep, inputcontext):
    """The four info fields contain a set (read: unique) of information
    about the added entity. This way sha256/inputname/inputssdeep are
    linked and retrievable."""
    inputcontext = clean_context(inputcontext)
    splitcontext = inputcontext.split('|')
    inputsha256 = inputsha256.lower()

    r.sadd('info:inputname:{}'.format(inputname),
           'sha256:{}:ssdeep:{}:context:{}'.format(inputsha256,
                                                   inputssdeep,
                                                   inputcontext))
    r.sadd('info:ssdeep:{}'.format(inputssdeep),
           'sha256:{}:context:{}:inputname:{}'.format(inputsha256,
                                                      inputcontext,
                                                      inputname))
    r.sadd('info:sha256:{}'.format(inputsha256),
           'ssdeep:{}:context:{}:inputname:{}'.format(inputssdeep,
                                                      inputcontext,
                                                      inputname))
    r.sadd("hashes:ssdeep", '{}'.format(inputssdeep))
    r.sadd("names:inputname", '{}'.format(inputname))
    # pull all most significant contexts from an ssdeep and, if they are
    # different, add the combined names to splitcontext for inclusion in
    # "names:context".
    # Because the ssdeeps are similar, this will make different naming
    # schemes explicit.
    for contexts in r.smembers('info:ssdeep:{}'.format(inputssdeep)):
        context = contexts.split(':')[3].split('|')[0]
        if context != splitcontext[0]:
            context = '/'.join(sorted([context, splitcontext[0]]))
            splitcontext.append(context)

    for singlecontext in splitcontext:
        # add unique key to set with 'incr 1' to keep track of occurance
        # and create a ranked set. Rank may chance over time, but that
        # is not a problem when updates do not happen inbetween calls
        r.zincrby("names:context", '{}'.format(singlecontext), amount=1)
        info_string = 'sha256:{}:ssdeep:{}:inputname:{}:inputcontext:{}'
        r.sadd('info:context:{}'.format(singlecontext),
               info_string.format(inputsha256,
                                  inputssdeep, inputname, inputcontext))
    # timestamp is used for caching of query results. It is updated after
    # every addition so it never goes stale.
    logger.debug(timestamp())
    r.set("timestamp", timestamp())
    logger.debug(r.get("timestamp"))


def get_allsha256_for_ssdeep(ssdeep):
    """function which retrieves a string of unique sha256 hashes for
    an ssdeep hash. Theoretically a single ssdeep hash could match multiple
    different inputs, if the differences are insignificant."""
    allsha256s = [allsha256.split(':')[1]
                  for allsha256 in r.smembers('info:ssdeep:{}'.format(ssdeep))]
    allsha256s = str.join(':', set(allsha256s))
    logger.debug(f"=== DEBUG === : allsha256s: {allsha256s}")
    return allsha256s


def get_allcontext_for_ssdeep(ssdeep):
    """function which retrieves a string of unique context strings for
    an ssdeep hash. Theoretically a single ssdeep hash could match multiple
    different contexts, based on how they are added to the dataset."""
    allcontexts = [allcontext.split(':')[3]
                   for allcontext in
                   r.smembers('info:ssdeep:{}'.format(ssdeep))]
    allcontexts = str.join(':', set(allcontexts))
    logger.debug(f"=== DEBUG === : allcontexts: {allcontexts}")
    return allcontexts


def return_results(inputname, inputsha256, inputssdeep, inputcontext):
    """The results should be in json. But the json.dumps function
    cannot deal with python sets, so we turn them into lists.
    additionally we retrieve other files with the same sha256 and,
    last but not least, it siblings (partially matching ssdeep hashes)."""
    info = dict()
    info['inputname'] = inputname
    info['sha256'] = inputsha256.lower()
    info['ssdeep'] = inputssdeep
    info['context'] = inputcontext
    info['other_inputnames'] = [inputnames.split(':')[-1]
                                for inputnames in
                                r.smembers('info:sha256:{}'.format(inputsha256))
                                if inputnames.split(':')[-1] not in inputname]
    info['siblings'] = list(r.zrangebyscore(inputssdeep, min=0,
                            max='+inf', withscores=True))
    return(info)


def new_hash(inputsha256):
    """ To speed things up, we take a different path if the file is already known.
    return True if new, False if the hash is already known."""
    inputsha256 = inputsha256.lower()
    if r.sismember("hashes:sha256", '{}'.format(inputsha256)):
        new = False
    else:
        new = True
    return new


def add_ssdeep_to_db(inputname, inputsha256, inputssdeep, inputcontext):
    inputsha256 = inputsha256.lower()
    # If the file is new, add all information
    if new_hash(inputsha256):
        inputname = clean_name(inputname)
        r.sadd("hashes:sha256", '{}'.format(inputsha256))
        add_info(inputname, inputsha256, inputssdeep, inputcontext)
        ssdeep_compare = preprocess_ssdeep(inputssdeep)
        for rolling_window_ssdeep in ssdeep_compare:
            ssdeep_sets = get_ssdeep_sets(rolling_window_ssdeep, inputssdeep)
            add_ssdeep_to_rolling_window(rolling_window_ssdeep, inputssdeep)
            for sibling_ssdeep in ssdeep_sets:
                # Add sibling_ssdeep to the inputssdeep
                # XXX maybe add zscore check to optimise away the compare
                st = '{},{},{}'
                r.zadd(inputssdeep,
                       float(ssdeep.compare(sibling_ssdeep, inputssdeep)),
                       st.format(sibling_ssdeep,
                                 get_allsha256_for_ssdeep(sibling_ssdeep),
                                 get_allcontext_for_ssdeep(sibling_ssdeep)))
                # Add inputssdeep to sibling_ssdeep
                r.zadd(sibling_ssdeep,
                       float(ssdeep.compare(inputssdeep, sibling_ssdeep)),
                       st.format(inputssdeep,
                                 inputsha256,
                                 inputcontext.replace(',', '|')))

    # or else, add only the new info
    else:
        inputname = clean_name(inputname)
        inputsha256 = inputsha256.lower()
        add_info(inputname, inputsha256, inputssdeep, inputcontext)


def rest_add(info_object):
    """This function should receive a list of dictionaries.
    Each dictionary must consist of:
    {"inputname": <>, "sha256": <>, "ssdeep": <>, "contexts": ["<>", "<>", "<>"]}
    The most important context must be the first in the list."""
    logger.debug(f"=== DEBUG === : ingesting info_object: {info_object}")

    # sanity check
    for rest_info in info_object:
        inputname = clean_name(rest_info['inputname'])
        if check_sha256(rest_info['sha256']):
            input_sha256 = rest_info['sha256'].lower()
        else:
            return False
        if check_ssdeep(rest_info['ssdeep']):
            input_ssdeep = rest_info['ssdeep']
        else:
            return False
        if len(rest_info['contexts']) == 0:
            return False

        contexts = list(map(lambda x: clean_context(x), rest_info['contexts']))
        input_contexts = ','.join(contexts)
        add_ssdeep_to_db(inputname, input_sha256, input_ssdeep, input_contexts)
        return True
