# `kathe`

Redesign of `kathe`, together with the people of NCSC-NL.

## A short history of `kathe`  

`kathe` started as a pet project at [KPN-CISO](https://github.com/kpn-ciso) to implement a quick and dirty enrichment of our CTI with similar binaries. The main problems to be solved were not having to do any-to-any comparisons on large data sets, and having an API we could talk to.

Although `kathe` does this just fine, it does suffer from some unfortunate design mistakes, overkill, feature creep and tons of slow Python. Not to mention my coding skills, which were –and still are– just barely functioning hackery.

This is the latest attempt, with the `kathe-cli` tool currently being written in [Rust](https://www.rust-lang.org/), and the backend/API/web interface in [Golang](https://go.dev/). Why two languages? Because of personal preferences. ¯\\_(ツ)_/¯

So, although `kathe-cli` already exists (sort of), for now my focus will be this document. documenting every design choice and data-type. Because I'd rather be caught before my mistakes, love of overkill, and feature creep again get the better of me.

## keys, types and context

| key name  | value type               | redis type | example            | context                                                      |
| --------- | ------------------------ | ---------- | ------------------ | ------------------------------------------------------------ |
| timestamp | String [epoch.as_micros] | key        | `1651605418685632` | Used to timestamp latest additions to the database, and be able to identify and remove stale caches |
|           |                          |            |                    |                                                              |
|           |                          |            |                    |                                                              |

