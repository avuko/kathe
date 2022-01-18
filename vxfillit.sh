#!/usr/bin/env bash
# using db 13 for prod 
# 13 = binaries
db='13'

./vxug.py | while read line; do echo "${line}" && ./kathe-cli.py ${line} -r "${db}";done
