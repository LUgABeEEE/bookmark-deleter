import test from "node:test";
import assert from "node:assert/strict";
import { collectMatches, normaliseList } from "../lib/match.js";

const tree = [
  {
    id: "0",
    children: [
      { id: "1", url: "https://a.example/" },
      { id: "2", url: "https://b.example/" },
      {
        id: "3",
        children: [
          { id: "4", url: "https://dead.example/" },
          { id: "5", url: "https://dead.example/" },
        ],
      },
    ],
  },
];

test("collectMatches walks the tree and keeps duplicates", () => {
  assert.deepEqual(collectMatches(tree, ["https://dead.example/"]), ["4", "5"]);
});

test("collectMatches ignores non-matching and folder nodes", () => {
  assert.deepEqual(collectMatches(tree, ["https://nope.example/"]), []);
});

test("collectMatches handles an empty tree", () => {
  assert.deepEqual(collectMatches([], ["https://dead.example/"]), []);
});

test("normaliseList trims, drops non-strings and de-duplicates", () => {
  assert.deepEqual(
    normaliseList([" https://x/ ", "https://x/", "", 42, null, "https://y/"]),
    ["https://x/", "https://y/"],
  );
});

test("normaliseList returns [] for a non-array", () => {
  assert.deepEqual(normaliseList({ a: 1 }), []);
});
