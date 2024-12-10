import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, Match, Option, pipe } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { findFirstIndex } from "../../../utils/Array";

const newline = Syntax.char("\n");
const guard = ["<", "^", ">", "v"];
const empty = ".";
const obstacle = "#";
const path = "X"
const cell = Syntax.charIn([...guard, empty, obstacle, path]);
export const grammer = pipe(cell, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());

const up = ([x, y]: [number, number]) => [x, y - 1] as const;
const down = ([x, y]: [number, number]) => [x, y + 1] as const;
const left = ([x, y]: [number, number]) => [x - 1, y] as const;
const right = ([x, y]: [number, number]) => [x + 1, y] as const;
const turn90cw = (current: string) => pipe(
  Match.value(current),
  Match.when(">", () => "v"),
  Match.when("^", () => ">"),
  Match.when("<", () => "^"),
  Match.when("v", () => "<"),
  Match.exhaustive
)

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const initial = parseInput(grammer, input);
    const guardPosition = findFirstIndex(initial)((x) => guard.includes(x));
    while(Option.isSome(guardPosition)) {
      
    }
    return guardPosition;
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
