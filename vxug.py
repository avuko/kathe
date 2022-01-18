#!/usr/bin/env python3
# this one expects your vxunderground samples to be in a 'vxug' dir
# grouped in dirs of 'Block.101' etc.
# this works only if the file naming scheme is similar to the one in Block.102
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
for root, dirs, files in os.walk("vxug"):
    for name in files:
        filename = os.path.join(root, name)
        fileroot = root
        familytree = root.split("/")
        name_as_contexts = name.split(".")
        # exit(1)
        if (".md" not in name and ".json" not in name
                and ".txt" not in name and '.yar' not in name
                and '.git' not in filename):
            contexts = familytree[0] + "," + familytree[1]
            #if len(familytree) > 2:
            contexts = contexts + "," + ','.join(familytree[2:]) + ','.join(name_as_contexts)
            # familyname = root.split("/")[1]
            # filesha256 = file_sha256('{}'.format(filename))
            # filessdeep = file_ssdeep('{}'.format(filename))
            print(' -c ' + contexts + ' -f ' + shlex.quote(filename))
