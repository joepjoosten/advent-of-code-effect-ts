import * as Syntax from "@effect/parser/Syntax";0
import { Array, Chunk, Effect, pipe } from "effect";
import { parseInput, toArray, toInteger } from "../../../utils/parser";
import { logPipe, sumArray } from "../../../utils/utils";

const backSeperator = Syntax.char("\n");
const joltage = Syntax.repeat(pipe(Syntax.digit, toInteger))

const bank = pipe(joltage, toArray()); 
export const grammer = pipe(bank, Syntax.repeatWithSeparator1(backSeperator), toArray());

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
      Array.map((nums) => [nums, findMaxIndex(nums, 0, nums.length - 1)] as const),
      Array.map(([nums, maxIndexLeft]) => [nums, maxIndexLeft, findMaxIndex(nums, maxIndexLeft + 1, nums.length)] as const),
      Array.map(([nums, maxIndexLeft, maxIndexRight]) => '' + nums[maxIndexLeft] + nums[maxIndexRight]),
      Array.map(s => parseInt(s)),
      sumArray
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
