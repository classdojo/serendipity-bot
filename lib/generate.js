const fs           = require("fs");
const crypto       = require("crypto");
const path         = require("path");
const random       = require("random-js");
const combinations = require("js-combinatorics").combination;

module.exports = function generate (inputFilePath, options = {}) {
  /*
    Assign defaults
  */
  options.delimiter = options.delimiter || "\n";
  options.seed = options.seed || "serendipity";

  /*
    Read input file
  */
  if (!inputFilePath) {
    throw new Error("Must provide an input file path as the first argument. This file should contain a newline-delimited list of names.")
  }
  try {
    var input = fs.readFileSync(inputFilePath).toString().split(options.delimiter || "\n");
  } catch (err) {
    err.message = `Could not load input file at \`${inputFilePath}\`: ${err.message}`;
    throw err;
  }

  if (input.length < 3) {
    throw new Error(`Input file must contain at least three names. Instead received: ${input.join(", ")}`);
  }

  /*
    Get all pairings of team members.
  */
  const pairings = combinations(input, 2).toArray();

  /*
    Deterministically shuffle this array.  This is preferred because combinations
    are outputted in sorted order (i.e. AB, AC, AD, AE, BC, BD, ...).
  */
  const engine = random.engines.mt19937();
  engine.seed(parseInt(options.seed, 10));
  random.shuffle(engine, pairings);

  /*
    Each time the script is called, we increment an index, and select the combination
    at that index to be paired for a meeting.
  */
  const indexFileName = `.index-${crypto.createHash("md5").update(input.join(",")).digest("hex")}`;
  const indexFilePath = path.resolve(__dirname, "..", indexFileName);

  let index;
  try {
    index = parseInt(fs.readFileSync(indexFilePath), 10) + 1;
  } catch (ex) {
    index = 0;
  }
  fs.writeFileSync(indexFilePath, String(index % pairings.length));

  /*
    Pick our pair and write to either the console or to Slack.
  */
  const pairing = pairings[index % pairings.length];
  const messageText = `Today's one-on-one meeting is between ${pairing[0]} and ${pairing[1]}!`;
  return messageText;
}