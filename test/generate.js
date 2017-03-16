const _            = require("lodash");
const fs           = require("fs");
const path         = require("path");
const expect       = require("expect");
const combinations = require("js-combinatorics").combination;

const generate     = require("../lib/generate");

describe("generate", () => {

  const inputPath = path.resolve("input");
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

  function cleanup () {
    try {
      fs.unlinkSync(inputPath);
      fs.readdirSync(path.join(__dirname, ".."))
        .filter((filename) => /^\.index-/.test(filename))
        .forEach((filename) => fs.unlinkSync(path.join(__dirname, "..", filename)));
    } catch (__) {}
  }

  beforeEach(cleanup);
  afterEach(cleanup);

  beforeEach(() => fs.writeFileSync(inputPath, input.join("\n")));

  it("Deterministically generates a pairing of two peope", () => {
    const result = generate(inputPath);
    expect(result).toBe("Today's one-on-one meeting is between Mary and George!");
  });

  it("Cycles through all combinations before repeating", () => {
    const numCombinations = combinations(input, 2).toArray().length;
    const results = _.times(2 * numCombinations, () => generate(inputPath));
    expect(_.uniq(results).length).toBe(numCombinations);
    _.times(numCombinations, (n) => expect(results[n]).toBe(results[n + numCombinations]));
  });

  it("Can accept a different random seed", () => {
    const options = {seed: 1234};
    const result = generate(inputPath, options);
    expect(result).toBe("Today's one-on-one meeting is between John and Ringo!");
  });

  it("Can accept a different delimiter", () => {
    const delimiter = "|";
    fs.writeFileSync(inputPath, input.join(delimiter));
    const options = {delimiter};

    const result = generate(inputPath, options);
    expect(result).toBe("Today's one-on-one meeting is between Mary and George!");
  });

  it("Can accept a custom message", () => {
    const result = generate(inputPath, {message: "Hello {{1}} and {{2}}"});
    expect(result).toBe("Hello Mary and George");
  });

  it("Errors if no input path is given", () => {
    expect(() => generate(null))
      .toThrow("Must provide an input file path as the first argument. This file should contain a newline-delimited list of names.");
  });

  it("Errors if input path cannot be loaded", () => {
    expect(() => generate("./asdfasdf"))
      .toThrow(/Could not load input file at/);
  });

  it("Errors if less than three people are in the input", () => {
    const badInput = ["Foo", "Bar"];
    fs.writeFileSync(inputPath, badInput.join("\n"));
    expect(() => generate(inputPath))
      .toThrow(`Input file must contain at least three names. Instead received: ${badInput.join(", ")}`);
  });

  it("Errors if custom message does not contain placeholder strings", () => {
    expect(() => generate(inputPath, {message: "Hello {1} and {2}"}))
      .toThrow("Custom message must contain the placeholder strings {{1}} and {{2}}");
  });

});