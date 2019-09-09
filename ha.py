#!/usr/bin/env python
import os
import unicodedata
from datetime import datetime


def timestamp():
    ts = int(datetime.now().strftime("%s") + str(datetime.now().microsecond))
    return ts


# Fixed variables
haurl = 'https://www.hybrid-analysis.com/'
hafeed = 'api/v2/feed/latest?_timestamp={}'.format(timestamp())

# lots of bad input


def remove_control_characters(s):
    """Some input (like filenames) has some really nasty control chars.
    This trick removes those (https://stackoverflow.com/a/19016117)"""
    return "".join(ch for ch in s if unicodedata.category(ch)[0] != "C")


def replace_badchars(inputstring):
    """Stringing together '.replace' seems the fastest way
    to do this: https://stackoverflow.com/a/27086669"""
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
    cleanname = cleanname.replace(',', '').lower()
    return (cleanname)


info = {}


# proxies = {"http": 'http://127.0.0.1:8080',
#           "https": 'http://127.0.0.1:8080'
#           }
proxies = {}

def main():
    try:
        import requests
    except ImportError:
        exit('error importing requests')
    try:
        import secrets
    except ImportError:
        exit('error importing secrets')

    kathe_add_endpoint = secrets.kathe_add_endpoint
    headers = {'User-Agent': 'Falcon Sandbox',
               'api-key': secrets.haapikey}
    response = requests.get(haurl + hafeed, headers=headers)
    # for now we test with a local file
    # import json
    # with open('ha.json') as f:
    #    response = json.load(f)
    response = response.json()
    response = response['data']
    for job in response:
        try:
            job_ssdeep = job['ssdeep']
            try:
                job_name = clean_name(job['submit_name'])
            except KeyError:
                job_name = clean_name(job['sha256'])
            job_sha256 = job['sha256']
            job_tags = ['hybrid-analysis']
            try:
                # apparently tags is always a list
                for job_tag in job['tags']:
                    job_tags.append(clean_name(job_tag))
            except KeyError:
                job_tags = ['hybrid-analysis']

            try:
                # apparently family is always a string
                job_tags.append(clean_name(job['vx_family']))
            except KeyError:
                pass
            try:
                # add analysis date as context
                timedate_contexts = job['analysis_start_time'].split(' ')[0].split('-')
                # print(timedate_contexts[0])
                job_tags.append(timedate_contexts[0])
                job_tags.append('-'.join(timedate_contexts[0:2]))
                job_tags.append('-'.join(timedate_contexts[0:3]))

            except KeyError:
                pass
            info['contexts'] = job_tags
            info['ssdeep'] = job_ssdeep
            info['sha256'] = job_sha256
            info['inputname'] = job_name
            payload = {'info': [info]}
            print(payload)
            postdata = requests.post(kathe_add_endpoint, json=payload, proxies=proxies)
            print(postdata.headers, postdata.status_code)
        except KeyError:
            pass


if __name__ == "__main__":
    main()
