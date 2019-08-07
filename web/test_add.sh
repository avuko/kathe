#!/usr/bin/env bash
data1='
{
    "info": [
        {
            "contexts": [
                "contexttest-1-1",
                "contexttest\\//-1-2",
                "contexttest-:,1-3",
                "badcharscontext"
            ],
            "inputname": "94a139fdfab537c7ec32d5e5f468f1d178559940c6f9bcb8079cc78ca3554081",
            "sha256": "94a139fdfab537c7ec32d5e5f468f1d178559940c6f9bcb8079cc78ca3554081",
            "ssdeep": "768:cUUQKGXqUAcqjqOQkB7y20Iy2lCwZU9QZU9Xdapt6CNh5FO8Wz:cUT1XhAcqNQkhhlxzasptTNh5Q8W"
        }
    ]
}
'

data2='
{
    "info": [
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
data3='
{
    "info": [
        {
            "contexts": [
                "trojan.wisdomeyes.16070401.9500",
                "exe",
                "hybridanalysis",
                "badssdeep"
            ],
            "inputname": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afc",
            "sha256": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afc",
            "ssdeep": "768:yU8Uk/935h7OAL/mZbH7i-jHF8cE3V3hJ/0rm6kpFV8ezy6jNfuP+xhtrfZU9qZU9j:SUkUM/aPHFnW3X+kxBjNSmtrfp0"
        }
    ]
}
'
data4='
{
    "info": [
        {
            "contexts": [
                "trojan.wisdomeyes.16070401.9500",
                "exe",
                "hybridanalysis",
                "badsha256"
            ],
            "inputname": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afd",
            "sha256": "768:yU8Uk/935h7OAL/mZbH7ijHF8cE3V3hJ/0rm6kpFV8ezy6jNfuP+xhtrfZU9qZU9j:SUkUM/aPHFnW3X+kxBjNSmtrfp0",
            "ssdeep": "768:yU8Uk/935h7OAL/mZbH7ijHF8cE3V3hJ/0rm6kpFV8ezy6jNfuP+xhtrfZU9qZU9j:SUkUM/aPHFnW3X+kxBjNSmtrfp0"
        }
    ]
}
'
data5='
{
    "info": [
        {
            "contexts": [
                "trojan.wisdomeyes.16070401.9500",
                "exe",
                "hybridanalysis",
                "badjson"
            ]
            "inputname": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afe",
            "sha256": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872afe",
            "ssdeep": "768:yU8Uk/935h7OAL/mZbH7i-jHF8cE3V3hJ/0rm6kpFV8ezy6jNfuP+xhtrfZU9qZU9j:SUkUM/aPHFnW3X+kxBjNSmtrfp0"
        }
    ]
}
'
data6='
{
    "info": [
        {
            "contexts": [
                "trojan.wisdomeyes.16070401.9500",
                "exe",
                "hybridanalysis",
                "badssdeepformat"
            ],
            "inputname": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872aff",
            "sha256": "94345f337bd59d61678a6d0140603334eba7550e2ca1b9843cbc09b9c9872aff",
            "ssdeep": "768:yU8Uk/935h7OAL/mZbH7i-jHF8cE3V3hJ/0rm6kpFV8ezy6jNfuP+xhtrfZU9qZU9jSUkUM/aPHFnW3X+kxBjNSmtrfp0"
        }
    ]
}
'


echo "data1: bad chars in context, should PASS"
curl -w " %{http_code}" http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data1}"
echo ""

echo "data2: correct format, should PASS"
curl -w " %{http_code}" http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data2}"
echo ""

echo "data3: bad chars in ssdeep, should FAIL"
curl -w " %{http_code}" http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data3}"
echo ""

echo "data4: bad chars in sha256, should FAIL"
curl -w " %{http_code}" http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data4}"
echo ""

echo "data5: incorrect json, should FAIL"
curl -w " %{http_code}" http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data5}"
echo ""

echo "data6: incorrect format ssdeep, should FAIL"
curl -w " %{http_code}" http://127.0.0.1/add -H 'Content-Type: application/json' -d "${data6}"
echo ""
