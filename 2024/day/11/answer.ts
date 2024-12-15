import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, pipe } from "effect";
import { integer, parseInput, toArray } from "../../../utils/parser";
import { sumArray } from "../../../utils/utils";

export const grammer = pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(" ")), toArray());

type BlinkNr = number;
type Stone = number;
type StonesLength = number;

const sliceNumber = (x: number) => (start: number, end: number) => parseInt(x.toString(10).slice(start, end));

type BlinkHashMap = Record<Stone, Record<BlinkNr, StonesLength>>;
const blink = (blinkNr: BlinkNr, dic: BlinkHashMap) => (stone: Stone): StonesLength => {
  if(blinkNr === 0) {
    return 1;
  }

  if(dic[stone] && dic[stone][blinkNr]) {
    return dic[stone][blinkNr];
  }

  let stonesLength: StonesLength;
  const oom = stone.toString(10).length;
  if(stone === 0) {
    stonesLength = blink(blinkNr - 1, dic)(1);
  } else if(oom % 2 === 0) {
    stonesLength = blink(blinkNr - 1, dic)(sliceNumber(stone)(0, oom / 2)) + blink(blinkNr - 1, dic)(sliceNumber(stone)(oom / 2, oom));
  } else {
    stonesLength = blink(blinkNr - 1, dic)(stone * 2024);
  }

  if(dic[stone] === undefined) {
    dic[stone] = {};
  }
  dic[stone][blinkNr] = stonesLength;

  return stonesLength
}

export const part1 = (input: string) =>
  Effect.gen(function* () {
    let stones = parseInput(grammer, input);
    return pipe(
      stones,
      Array.map(blink(25, {})),
      sumArray
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    let stones = parseInput(grammer, input);
    return pipe(
      stones,
      Array.map(blink(75, {})),
      sumArray
    )
  });
