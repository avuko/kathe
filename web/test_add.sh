#!/usr/bin/env bash
data='
{
    "info": [
        {
            "contexts": [
                "contexttest-1-1",
                "contexttest\\//-1-2",
                "contexttest-:,1-3"
            ],
            "inputname": "94a139fdfab537c7ec32d5e5f468f1d178559940c6f9bcb8079cc78ca3554081",
            "sha256": "94a139fdfab537c7ec32d5e5f468f1d178559940c6f9bcb8079cc78ca3554081",
            "ssdeep": "768:cUUQKGXqUAcqjqOQkB7y20Iy2lCwZU9QZU9Xdapt6CNh5FO8Wz:cUT1XhAcqNQkhhlxzasptTNh5Q8W"
        },
        {
            "contexts": [
                "trojan.wisdomeyes.16070401.9500",
                "exe",
                "hybridanalysis"
            ],
            "inputname": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afb",
            "sha256": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afb",
            "ssdeep": "768:yU8Uk/935h7OAL/mZbH7jHF8cE3V3hJ/0rm6kpFV8ezy6jNfuP+xhtrfZU9qZU9j:SUkUM/aPHFnW3X+kxBjNSmtrfp0"
        }
    ]
}
'

# echo "${data}"
curl http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data}"
echo ""
