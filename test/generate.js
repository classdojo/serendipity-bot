const _            = require("lodash");
const fs           = require("fs");
const path         = require("path");
const expect       = require("expect");
const combinations = require("js-combinatorics").combination;

const generate     = require("../lib/generate");

describe("generate", () => {

  const inputPath = path.resolve("input");
  const indexPath = path.resolve("indexFile");

  const input = [
    "Peter",
    "Paul",
    "Mary",
    "John",
    "George",
    "Ringo",
    "Keith",
    "Mick",
  ];

  const defaultOptions = {index: indexPath};

  function cleanup () {
    try {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(indexPath);
    } catch (__) {}
  }

  beforeEach(cleanup);
  afterEach(cleanup);

  beforeEach(() => fs.writeFileSync(inputPath, input.join("\n")));

  it("Deterministically generates a pairing of two peope", () => {
    const result = generate(inputPath, defaultOptions);
    expect(result).toBe("Today's one-on-one meeting is between Mary and George!");
  });

  it("Cycles through all combinations before repeating", () => {
    const numCombinations = combinations(input, 2).toArray().length;
    const results = _.times(2 * numCombinations, () => generate(inputPath, defaultOptions));
    expect(_.uniq(results).length).toBe(numCombinations);
    _.times(numCombinations, (n) => expect(results[n]).toBe(results[n + numCombinations]));
  });

  it("Can accept a different random seed", () => {
    const options = _.defaults({seed: 1234}, defaultOptions);
    const result = generate(inputPath, options);
    expect(result).toBe("Today's one-on-one meeting is between John and Ringo!");
  });

  it("Can accept a different delimiter", () => {
    const delimiter = "|";
    fs.writeFileSync(inputPath, input.join(delimiter));
    const options = _.defaults({delimiter}, defaultOptions);

    const result = generate(inputPath, options);
    expect(result).toBe("Today's one-on-one meeting is between Mary and George!");
  });

  it("Errors if no input path is given", () => {
    expect(() => generate(null, defaultOptions))
      .toThrow("Must provide an input file path as the first argument. This file should contain a newline-delimited list of names.");
  });

  it("Errors if input path cannot be loaded", () => {
    expect(() => generate(indexPath, defaultOptions))
      .toThrow(/Could not load input file at/);
  });

  it("Errors if less than three people are in the input", () => {
    const badInput = ["Foo", "Bar"];
    fs.writeFileSync(inputPath, badInput.join("\n"));
    expect(() => generate(inputPath, defaultOptions))
      .toThrow(`Input file must contain at least three names. Instead received: ${badInput.join(", ")}`);
  });

});