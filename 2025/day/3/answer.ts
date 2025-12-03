import * as Syntax from "@effect/parser/Syntax";0
import { Array, Chunk, Effect, pipe } from "effect";
import { parseInput, toArray, toInteger } from "../../../utils/parser";
import { logPipe, sumArray } from "../../../utils/utils";

const backSeperator = Syntax.char("\n");
const joltage = Syntax.repeat(pipe(Syntax.digit, toInteger))
const bank = pipe(joltage, toArray()); 
export const grammer = pipe(bank, Syntax.repeatWithSeparator1(backSeperator), toArray());

const findMaxNumbers = (nums: number[], howMany: number) => {
  const result = [];
  let maxIndex = -1;
  for (let left = howMany; left > 0; left--) {
    maxIndex = findMaxIndex(nums, maxIndex + 1, nums.length - left + 1);
    result.push(nums[maxIndex]);
  }
  return result;
}

const findMaxIndex = (nums: number[], start: number, end: number) => {
  const slice = nums.slice(start, end);
  const max = Math.max(...slice);
  return slice.findIndex((num) => num === max) + start;
}

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      Array.map((nums) => findMaxNumbers(nums, 2)),
      Array.map((foundNums) => foundNums.join('')),
      Array.map(s => parseInt(s)),
      sumArray
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    return pipe(
      parsed,
      Array.map((nums) => findMaxNumbers(nums, 12)),
      Array.map((foundNums) => foundNums.join('')),
      Array.map(s => parseInt(s)),
      sumArray
    )
  });
