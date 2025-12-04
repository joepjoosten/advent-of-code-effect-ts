import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, pipe, Option } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { bottom, bottomLeft, bottomRight, getXY, height, left, right, setXY, top, topLeft, topRight, width } from "../../../utils/Array";

export const grammer = pipe(Syntax.charIn('.@'), Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(Syntax.char("\n")), toArray());

const isRoll = s => s === '@'
const nextGeneration = (parsed: string[][]): [grid: string[][], remmoved: number] => {
  let newGrid = Array.replicate(Array.replicate('.', height(parsed)), width(parsed)) as string[][];
  let count = 0;
  for(let x = 0; x < width(parsed); x++) {
    for(let y = 0; y < height(parsed); y++) {
      if(Option.exists(getXY([x, y])(parsed), isRoll)) {
        const neighbors = pipe(
          [top, bottom, left, right, topLeft, topRight, bottomLeft, bottomRight],
          Array.map(f => f([x, y])(parsed)),
          Array.map(Option.filter(isRoll)),
          Array.countBy(Option.isSome)
        )
        if(neighbors < 4) {
          count++;
        } else {
          newGrid = setXY([x, y], '@')(newGrid);
        }
      }
    }
  }
  return [newGrid, count];
}

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    const [, removed] = nextGeneration(parsed);
    return removed;
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const parsed = parseInput(grammer, input);
    let count = 0;
    let current = [parsed, Infinity] as [string[][], number];
    while (current[1] !== 0) {
      current = nextGeneration(current[0]);
      count += current[1];
    }
    return count;
  });
