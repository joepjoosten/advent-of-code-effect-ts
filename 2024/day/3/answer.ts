import { Array, Effect, Match, pipe, Tuple } from "effect";

export const detectMul = /mul\((\d{1,3}),(\d{1,3})\)/g;
export const detectDoDontMul = /(mul\((\d{1,3}),(\d{1,3})\))|(do\(\))|don't\(\)/g;
const parser = (input: string) =>
  [...input.matchAll(detectMul)].map(([, lhs, rhs]) => [parseInt(lhs), parseInt(rhs)] as const);
const parserPart2 = (input: string) =>
  [...input.matchAll(detectDoDontMul)].map(
    ([, mul, lhs, rhs, doo]):
      | { _tag: "mul"; mul: readonly [number, number] }
      | { _tag: "do" }
      | { _tag: "dont" } => {
      if (mul) {
        return { _tag: "mul", mul: [parseInt(lhs), parseInt(rhs)] as const };
      } else if (doo) {
        return { _tag: "do" };
      } else {
        return { _tag: "dont" };
      }
    }
  );

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parser(input),
      Array.reduce(0, (acc, [lhs, rhs]) => acc + lhs * rhs)
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parserPart2(input),
      Array.reduce([true, 0] as const, ([enabled, acc], instr) =>
        pipe(
          Match.value(instr),
          Match.when({ _tag: "mul" }, ({ mul }) => [enabled, enabled ? acc + mul[0] * mul[1] : acc] as const),
          Match.when({ _tag: "do" }, () => [true, acc] as const),
          Match.when({ _tag: "dont" }, () => [false, acc] as const),
          Match.exhaustive
        )
      ),
      Tuple.getSecond
    );
  });
