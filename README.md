# kathe.py

## kathe.py store

The storage function(s) add cross-linked info to redis: filename◀ ▶ssdeep◀ ▶sha256◀ ▶context.

Additionally, unique lists of sha256 hashes,ssdeep hashes and filenames are created, to be able to access all info in
the redis store.

There are a number of "Indeces" which can help you access all data:

```
(smembers) hashes:sha256
(smembers) hashes:ssdeep
(smembers) names:filename
(smembers) names:context
```

Besides the rolling_window keys, which you probably won't need, there are
four additional key types you could use:

```
info:filename:<filename>
info:sha256:<sha256>
info:ssdeep:<ssdeep>
info:context:<context>
```

The real magic of the tool is hidden behind the simple keys with the name `<ssdeep hash>`.
These keys are a sorted set of (unique) elements with a score. The redis score holds the
result of a `ssdeep_compare` between the "parent" ssdeep and any partially similar sddeep
hash: "siblings".

## accessing lists of all sha256/filename/ssdeep/context stored:


### sha256 hashes

To get a list of all sha256 hashes of all stored info:

```bash
smembers hashes:sha256
```

To get a list of all ssdeep hashes of all stored info:

```bash
smembers hashes:ssdeep
```

To get a list of all filenames of all stored info:

```bash
smembers names:filename
```

To get a list of all contexts of all stored info:

```bash
smembers contexts
```

### filenames

To get information on a filename (to be precise: the "filename" field, as you can store
any identifying string there):

```bash
smembers info:filename:<filename>
```

Filenames are currently stripped of certain attributes before they are stored: `:`,`\`
and `"`.

### Particular sha256 hash

To get information on a sha256 hash:

```bash
smembers info:sha256:<sha256 hash>
```

As identical files can have many names, this will possibly return a number of (unique)
results. Format of the response:

```bash
 smembers info:sha256:bebd2a24d7a9267c6a7a49d5db0bdef614b1f2f4534fdf21847bccd47c9b3414
1) "ssdeep:3:BzgKzgKs3UUNUlrKR:VgOgCUGlrK:filename:555.555.555.555"
```

Ssdeeps always have the same format, so you can always access the filename in this string by
splitting on '`:`' and getting field **5** (counting from zero).


### Particular ssdeep hash

To get information on a ssdeep hash:

```bash
smembers info:ssdeep:<ssdeep hash>
```

As nearly identical files can potentially have the same ssdeep hash, this might return a number of (unique)
results. Format of the response:

```bash
smembers info:ssdeep:3:BiLlavWRGXKKRFMRGXeWRGXKKRDXKReM8fdzkhBUeoITELUXE+LidzL:B+GaUTPGa3RBQVKBUlITEwXBiVL
1) "sha256:2c6fb8394912bf96f7117438cf047544ce14d47707ce0ecc623e391c68170f7d:filename:555.555.555.555"
```

sha256 hashes always have the same format, so you can always access the filename in this string by
splitting on '`:`' and getting field **3** (counting from zero).

### Particular filename

A filename can be any arbitrary identifying string. In these examples I'm using IP addresses
as that makes sense for my use of the tool. Please feel free to abuse this field for any
arbitrary identifying string (except for ssdeep or sha256, cause that would
just be silly).

To get information on a filename:

```bash
smembers info:filename:<filename stripped of "badchars", see above>
```

As nearly identical files can potentially have the same ssdeep hash, this might return a number of (unique)
results. Format of the response:

```bash
smembers info:filename:555.555.555.555
1) "sha256:2c6fb8394912bf96f7117438cf047544ce14d47707ce0ecc623e391c68170f7d:ssdeep:3:BiLlavWRGXKK:B+GaUTPG"
```

sha256 hashes always have the same format, so you can always access the ssdeep hash in this string by
splitting on '`:`' and getting field **3,4,5** (counting from zero).

### Particular context

You will very likely want to know which files/ssdeeps/filenames appear in a
certain context. That is why I added 'context' (and made it a **MUST**).

Access to all the information is as simple as:

```bash
smembers info:context:honeydrops
```

## Workflow

### Workflow with a "json" file


```bash
wc -l trap1ssbot.txt
6659 trap1ssbot.txt

head -1 trap1ssbot.txt
["3:B0VIAXps3B8fWsdBR:wL/n", "555.555.555.555", "90bdef027359d35c5330977e1a4356c42073f54727bfd5584b573c35a77cee01"]

time cat trap1ssbot.txt | while read line ;do ./kathe.py -m "${line}";done

real	13m45.684s
user	12m3.477s
sys	1m36.648s
```

### Workflow with files

```
kathe⠠⠵ time find honeydrops/ -type f -exec ./kathe.py -c honeydrops -f {} \;
real1m56.541s
user1m44.280s
sys0m9.012s

kathe⠠⠵ ls			 honeydrops/ |wc -l
829
```
