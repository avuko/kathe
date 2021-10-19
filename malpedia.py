#!/usr/bin/env python3
import os
import hashlib
import shlex

try:
    import ssdeep
except ImportError:
    print("""module missing (see documentation):
    apt install python3-ssdeep (works better from apt than pip3)""")
    exit()
from collections import defaultdict


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


malwaredict = defaultdict(list)
familydict = defaultdict(list)
for root, dirs, files in os.walk("malpedia"):
    for name in files:
        filename = os.path.join(root, name)
        fileroot = root
        familytree = root.split("/")
        if (".md" not in name and ".json" not in name
                and ".txt" not in name and '.yar' not in name
                and '.git' not in filename):
            contexts = familytree[1] + "," + familytree[0]
            if len(familytree) > 2:
                contexts = contexts + "," + ','.join(familytree[2:])
                familyname = root.split("/")[1]
            filesha256 = file_sha256('{}'.format(filename))
            filessdeep = file_ssdeep('{}'.format(filename))
            print(' -c ' + contexts + ' -f ' + shlex.quote(filename))
