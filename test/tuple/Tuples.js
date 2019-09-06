/* eslint-disable func-names */
/* global artifacts, contract */

const Tuples = artifacts.require("Tuples");

contract("Tuples", function() {
  beforeEach(async function() {
    this.tuples = await Tuples.new();
  });

  it("calls b successfully", async function() {
    const result = await this.tuples.b();
    console.log({ result });
  });
});
