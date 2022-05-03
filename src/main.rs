use clap::Parser;
use redis::{Client, Commands, Connection, RedisResult};
use sha2::{Digest, Sha256};
use std::collections::HashSet;
use std::net::IpAddr;
use std::time::{SystemTime, UNIX_EPOCH};
use std::{fs, io, path::Path};

// Structure of command line arguments
#[derive(Parser, Debug)]
#[clap(author = "avuko", version = "0.1", about, long_about = None)]
struct Args {
    /// Get the filepath from cli
    #[clap(short, long, required(true))]
    filepath: String,

    /// Get the context from cli
    #[clap(short, long, required(true))]
    context: String,

    /// Set the database number (default 13)
    #[clap(short, long, default_value("7"))]
    dbnumber: String,

    /// Set the redis host (default 127.0.0.1)
    #[clap(short, long, default_value = "127.0.0.1")]
    redishost: String,

    /// Set the redis password (default redis)
    #[clap(short, long, default_value = "redis")]
    password: String,
}

/// Command line tool to fill the kathe redis store
/// input: command line arguments
/// output: file metadata stored in redis
fn main() {
    let args = Args::parse();
    // sanity checking redisdb
    let redisdb = match args.dbnumber.trim().parse::<i32>() {
        Ok(m) => m,
        Err(_) => 7,
    };
    // sanity checking redishost
    let redishost = match args.redishost.parse::<IpAddr>() {
        Ok(ip) => ip,
        Err(_) => "127.0.0.1".parse::<IpAddr>().unwrap(),
    };

    // here we prep all variables
    let redispassword = args.password;

    // get and chech file(path)
    let filepath = String::from(args.filepath);
    check_file(&filepath);

    // sanitize and create inputname
    let inputname = remove_badchars(&make_filename(&filepath));

    // create sh256 + ssddeep hashes
    let sha256output = make_sha256(&filepath);
    let ssdeepoutput = make_ssdeep(&filepath);

    // sanitize and create context array
    let context: Vec<String> = make_context(&args.context);
    let mut client = connect(redishost, redisdb, redispassword);

    // add_to_redis will be the function to store everything in redis
    let _: RedisResult<()> = add_info(&mut client, inputname, sha256output, ssdeepoutput, context);
}

/// Connect to redis
/// input: host ip address, redis db number and redis password
/// output: redis::Connection
fn connect(redishost: IpAddr, redisdb: i32, redispassword: String) -> Connection {
    redishost.to_string();
    redisdb.to_string();

    Client::open(format!(
        "redis://:{}@{}/{}",
        redispassword, redishost, redisdb
    ))
    .expect("invalid connection URL")
    .get_connection()
    .expect("Failed to connect to Redis")
}

/// Check whether we are given a file
/// input: Path
/// output: continue or exit(1)
fn check_file(filename: &String) {
    let filepath = Path::new(&filename);
    if filepath.is_file() {
        eprintln!("processing {}", &filename);
    } else {
        eprintln!("{} is not a file", &filename);
        std::process::exit(0x0001);
    }
}

/// Turn the filename into a string for parsing
/// input: &string [full path]
/// output: String [filename as lossy string]
fn make_filename(filename: &String) -> String {
    let filepath = Path::new(&filename);
    let newfilename = match filepath.file_name() {
        Some(newfilename) => newfilename,
        None => panic!("Cannot get a filename"),
    };
    let str_newfilename = String::from(newfilename.to_string_lossy());
    str_newfilename
}

/// Get the sha256 of a file reference
/// input: &String [full path to file]
/// output: String [sha256 hash]
fn make_sha256(filepath: &String) -> String {
    let mut hasher = Sha256::new();
    // Also works on a dir, so might need to verify its a "regular" file
    // This seems to need to be a mut, otherwise io::copy has mixed types
    let mut file = fs::File::open(&filepath).expect("Unable to open file");
    // placeholder (unused) _variable
    let _bytes_written = io::copy(&mut file, &mut hasher);
    let hash = hasher.finalize();
    return format!("{:x}", hash);
}

/// Get the ssdeep of a file
/// input: &String [full path to string]
/// output: String [ssdeep hash]
fn make_ssdeep(filepath: &String) -> String {
    let hash = ssdeep::hash_from_file(&filepath).unwrap();
    hash
}

/// Split provided context on comma and return a vec
/// input: &String from args.context
/// output: Vec<String> (*cleaned* list of contexts)
fn make_context(context: &String) -> Vec<String> {
    let context_vec: Vec<String> = context
        .split(",")
        .map(|s| remove_badchars(&s.to_string()))
        .collect();
    return context_vec;
}

/// Make timestamp to track latest additions, mark chaches etc.
/// input: None
/// output: String [epoch.as_micros]
fn make_timestamp() -> String {
    let since_the_epoch = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards");
    return format!("{:?}", since_the_epoch.as_micros());
}

/// Get current timestamp in redis
/// input: redis::Connection
/// output: RedisResult<usize> (timestamp)
fn get_timestamp(con: &mut Connection) -> RedisResult<usize> {
    let timestamp = redis::cmd("get").arg("timestamp").query(con);
    timestamp
}

/// Replace all unwanted characters from input with '_'
/// input: &String [unclean input]
/// output: &String [removed badchars]
fn remove_badchars(inputstring: &String) -> String {
    // https://programming-idioms.org/idiom/147/remove-all-non-ascii-characters
    // it seems is_control removes both ascii and utf8 control chars
    // let noasciicontrol = inputstring.replace(|c: char| c.is_ascii_control(), "");
    let noutfcontrol = inputstring.replace(|c: char| c.is_control(), "");
    // https://users.rust-lang.org/t/fast-removing-chars-from-string/24554
    // is_alphanumberic removes punctuation chars we like, so a blocklist it is.
    // Two characters are very important to clean out: "|" (used for context-strings)
    // and "/" (used to combine primary context strings).
    let nobadchars = noutfcontrol.replace(
        &[
            '�', '|', '/', '{', '}', ':', '\\', '(', ')', ',', '\"', ' ', ';', '\'',
        ][..],
        "",
    );
    return format!("{}", nobadchars);
}

/// Create a list of original ssdeep and all its rolling windows
/// input: String (ssdeep string>
/// output: Vec<String> containing original ssdeep at [0] and rolling windows, both block sizes
fn make_rolling_windows(ssdeep_hash: &String) -> Vec<String> {
    // https://stackoverflow.com/questions/26643688/how-do-i-split-a-string-in-rust
    let ssdeep_parts: Vec<String> = ssdeep_hash.split(":").map(|s| s.to_string()).collect();
    let blocksizestring = &ssdeep_parts[0];
    let blocksize: i32 = blocksizestring
        .parse()
        .expect("blocksize should always be an int");
    let ssdeep_part_single = &ssdeep_parts[1];
    let ssdeep_part_double = &ssdeep_parts[2];
    let blocksize_double = &blocksize * 2;

    let mut rolling_window_vec: Vec<String> = Vec::new();
    rolling_window_vec.push(ssdeep_hash.to_string());
    rolling_window_vec.extend(get_all_7_char_rolling_window(
        &blocksize,
        &remove_plusthree_chars(ssdeep_part_single),
        &blocksize_double,
        &remove_plusthree_chars(ssdeep_part_double),
    ));
    return rolling_window_vec;
}

/// The function below removes all 4 consecutive chars, until 3 consecutive chars are left
/// The ssdeep algorithm does this internally for ssdeep_compare too.
/// input: ssdeep partial string (single or double)
/// output: ssdeep partial string reduced
fn remove_plusthree_chars(ssdeep_part: &String) -> String {
    let mut ssdeep_clean: String = ssdeep_part.to_string();
    let chars: Vec<char> = ssdeep_part.chars().collect();
    for c in chars {
        let c4: String = [c, c, c, c].iter().collect();
        let c3: String = [c, c, c].iter().collect();
        ssdeep_clean = ssdeep_clean.replace(&c4, &c3);
    }
    return ssdeep_clean;
}

/// Create Vec from preprocessedssdeep containing single & double <blocksize>:<7 char rolling windows>
/// input: blocksize<i32>, blockdata<String>, blocksize_double<i32>, blockdata_double<String>
/// output: Vec<String>
fn get_all_7_char_rolling_window(
    blocksize: &i32,
    blockdata: &String,
    blocksize_double: &i32,
    blockdata_double: &String,
) -> Vec<String> {
    let blockdata_as_vec: Vec<char> = blockdata.chars().collect();
    let blockdata_double_as_vec: Vec<char> = blockdata_double.chars().collect();
    let mut rolling_window_vec: Vec<String> = Vec::new();
    for window in blockdata_as_vec.windows(7) {
        let window_string: String = window.iter().collect();
        rolling_window_vec.push(format!("{}:{}", blocksize, window_string));
    }
    for window in blockdata_double_as_vec.windows(7) {
        let window_string: String = window.iter().collect();
        rolling_window_vec.push(format!("{}:{}", blocksize_double, window_string));
    }
    return rolling_window_vec;
}

/// create a Vec of unique ssdeeps as found under the rolling windows
/// input: Vec<String> of original ssdeep and rolling windows
/// output: a Vec<string> of all similar ssdeeps
fn get_similar_ssdeep_sets(
    // in kathe-cli.py, this is get_ssdeep_sets
    con: &mut Connection,
    rolling_windows_ssdeep: &Vec<String>,
) -> HashSet<String> {
    let original_ssdeep: &String = &rolling_windows_ssdeep[0];
    println!("rws: {}", &rolling_windows_ssdeep[12]);
    let mut ssdeep_siblings: HashSet<String> = con.smembers(&rolling_windows_ssdeep[12]).unwrap();
    ssdeep_siblings.remove(original_ssdeep);
    return ssdeep_siblings;
}

/// store inputssdeep string under rolling_window_ssdeep key (unsorted unique set)
/// If a key does not exist, it is created
/// input: rolling_window_ssdeep
/// output: None/RedisResult<()>
fn add_ssdeep_to_rolling_window(
    con: &mut Connection,
    rolling_window_ssdeep: String,
    inputssdeep: String,
) -> () {
    let _: RedisResult<()> = con.sadd(rolling_window_ssdeep, inputssdeep);
}

/// This function will store our info into redis
/// The four info fields contain a set (read: unique) of information
/// about the added entity. This way sha256/inputname/inputssdeep are
/// linked and retrievable.
/// XXX This will be done differently, with SortedSet keys, and only the
/// info:ssdeep containing all the details
fn add_info(
    con: &mut Connection,
    inputname: String,
    inputsha256: String,
    inputssdeep: String,
    inputcontext: Vec<String>,
) -> RedisResult<()> {
    let timestamp = get_timestamp(con).unwrap();
    let ssdeep_rolling_window = make_rolling_windows(&inputssdeep);
    let similar_ssdeeps = get_similar_ssdeep_sets(con, &ssdeep_rolling_window);
    let inputcontext_string: String = inputcontext.join("|");
    let _: RedisResult<()> = con.sadd(
        format!("info:inputname:{}", inputname),
        format!(
            "sha256:{}:ssdeep:{}:context:{}",
            inputsha256, inputssdeep, inputcontext_string
        ),
    );
    let _: RedisResult<()> = con.sadd(
        format!("info:ssdeep:{}", inputssdeep),
        format!(
            "sha256:{}:context:{}:inputname:{}",
            inputsha256, inputcontext_string, inputname
        ),
    );
    let _: RedisResult<()> = con.sadd(
        format!("info:sha256:{}", inputssdeep),
        format!(
            "ssdeep:{}:context:{}:inputname:{}",
            inputssdeep, inputcontext_string, inputname
        ),
    );
    // build indexes
    let _: RedisResult<()> = con.sadd("hashes:ssdeep", &inputssdeep);
    let _: RedisResult<()> = con.sadd("names:inputname", &inputname);
    let _: RedisResult<()> = con.sadd("hashes:sha256", &inputsha256);

    for context in inputcontext.iter() {
        // XXX check with zrange names:context 1 -1 withscores
        // check for 5928db8b7b1714ead51392ad809242cd5a158defefe5309f3ae0238c20a500ab_unpacked"
        match context {
            _ => con.zincr("names:context", context, 1).unwrap(),
        }
    }
    // I don't think I care about primary
    // XXX DEBUG OUTPUT
    println!(
        "timestamp: {}, inputname: {}, inputsha256: {}, inputssdeep: {:#?}, inputcontext: {:#?}, ssdeep_rolling_window: {:#?}, similar_ssdeeps: {:#?} ",
        timestamp,
        inputname,
        inputsha256,
        inputssdeep,
        inputcontext,
        ssdeep_rolling_window,
        similar_ssdeeps,
    );
    // XXX DEBUG OUTPUT END

    Ok(())
}
