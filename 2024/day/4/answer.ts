import * as Syntax from "@effect/parser/Syntax";
import { Array, Console, Effect, pipe, String } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { getDiagonals, getHorizontals, getVerticals } from "../../../utils/Array";
import { sumArray } from "../../../utils/utils";

export const grammer = pipe(Syntax.charNotIn('\n'), Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(Syntax.char("\n")), toArray());

const occurences = (needle: string) => (s: string) => [...s.matchAll(new RegExp(needle, "g"))].length;

export const part1 = (input: string) =>
  Effect.gen(function* () {

    const p = parseInput(grammer, input);
    yield* Console.log(JSON.stringify(getDiagonals(p)));

    return pipe(
      parseInput(grammer, input),
      x => x,
      (xys) => [
        ...getHorizontals(xys),
        ...getVerticals(xys),
        ...getDiagonals(xys),
      ],
      Array.map(xs => Array.join(xs, "")),
      x => x,
      Array.map(s => {
        console.log(`${s.length}: ${s}: ${occurences("XMAS")(s)} + ${occurences("SAMX")(s)}`);
        return occurences("XMAS")(s) + 
        occurences("SAMX")(s)
      }),
      sumArray
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
