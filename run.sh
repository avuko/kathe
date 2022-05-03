#!/usr/bin/env bash
# docker run --name kathe-rust -d redis redis-server --save 60 1 --loglevel warning -v /docker/host/dir:/data
# cargo run -- -f tests/a196c6b8ffcb97ffb276d04f354696e2391311db3841ae16c8c9f56f36a38e92.exe

# fugly
cd tests/
./fillit.sh
cd ../
RUST_BACKTRACE=1 cargo run -- -f tests/5928db8b7b1714ead51392ad809242cd5a158defefe5309f3ae0238c20a500ab_unpacked -d 7 -r 127.0.0.1 --context win.revil,2019-05-05,5928db8b7b1714ead51392ad809242cd5a158defefe5309f3ae0238c20a500ab_unpacked 
