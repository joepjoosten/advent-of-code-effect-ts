import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, Option, pipe, Record } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { addPositions, floodFill, getXY, height, makeBy2d, width, zip2d, zipWithIndex2d } from "../../../utils/Array";
import { sumArray } from "../../../utils/utils";

const newline = Syntax.char("\n");
export const grammer = pipe(Syntax.alphaNumeric, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());

type Farm = Array.NonEmptyArray<Array.NonEmptyArray<string>>;
type Regions = Array.NonEmptyArray<Array.NonEmptyArray<string>>;
type Position = readonly [number, number];

const up = [-1, 0] as const; const down =  [1, 0] as const; const left =  [0, -1] as const; const right =  [0, 1] as const;
const neighbours = (pos: Position) => pipe(
  [up, down, left, right] as const,
  Array.map(addPositions(pos)),
)

const regions = (farm: Farm): Regions => {
  const regions = makeBy2d(width(farm), height(farm), () => "");
  let regionNr = 0;
  for(let x = 0; x < height(farm); x++) {
    for(let y = 0; y < width(farm); y++) {
      if(regions[x][y] === "") {
        const fill = floodFill(farm)(
          [x, y], 
          (pos, val) => pipe(
            neighbours(pos), 
            Array.filter((pos) => pipe(
              getXY(pos)(farm), 
              Option.match({ onNone: () => false, onSome: (v) => v === val })
            ))
          )
        );
        Array.forEach(fill, (([x, y]) => regions[x][y] = regionNr.toString(10)));
        regionNr++;
      }
    }
  }
  return regions;
}  

const fences = (pos: Position, farm: Farm) => pipe(
  neighbours(pos),
  Array.map((neighbour) => getXY(neighbour)(farm)),
  Array.filter(x => Option.isNone(x) || x.value !== Option.getOrThrow(getXY(pos)(farm))),
  Array.length
)

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const farm = parseInput(grammer, input);
    return pipe(
      regions(farm),
      zipWithIndex2d,
      Array.map(([region, pos]) => [region, fences(pos, farm)] as const),
      Array.groupBy(([region]) => region),
      Record.toEntries,
      Array.reduce(0, (acc, [, region]) => acc + (region.length * pipe(region, Array.map(([, count]) => count), sumArray))),
    )
  });

const corners = [[up,left],[up,right],[down, left],[down,right]] as const;
const vertices = (farm: Farm) => (pos: Position) => pipe(
  corners,
  Array.map(([ver, hor]) => [addPositions(pos)(ver), addPositions(pos)(hor), addPositions(pos)(addPositions(ver)(hor))] as const),
  Array.reduce(0, (acc, [ver, hor, diag]) => {
    const v = Option.getOrThrow(getXY(pos)(farm));
    const a = Option.getOrElse(getXY(ver)(farm), () => "");
    const b = Option.getOrElse(getXY(hor)(farm), () => "");
    const c = Option.getOrElse(getXY(diag)(farm), () => "");
    return acc + 
      (a !== v && b !== v ? 1 : 0) +
      (a === v && b === v && c !== v ? 1 : 0)
  })
)

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const farm = parseInput(grammer, input);
    return pipe(
      regions(farm),
      zipWithIndex2d,
      Array.map(([region, pos]) => [region, vertices(farm)(pos)] as const),
      Array.groupBy(([region]) => region),
      Record.toEntries,
      Array.reduce(0, (acc, [, region]) => acc + (region.length * pipe(region, Array.map(([, count]) => count), sumArray))),
    )
  });
