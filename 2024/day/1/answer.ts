import * as Syntax from "@effect/parser/Syntax";
import { Array, Chunk, Effect, Either, flow, HashMap, Option, Order, pipe, Tuple } from "effect";
import { repeatedChar, toInteger } from "../../../utils/parser.js";
import { distance, histogram, sumArray, sumChunk } from "../../../utils/utils.js";

const seperator = repeatedChar(" ", 3);
const newline = Syntax.char("\n");
const integer = pipe(Syntax.digit, Syntax.repeat1, Syntax.captureString, toInteger);
const line = pipe(integer, Syntax.repeatWithSeparator1(seperator));
export const grammer = pipe(line, Syntax.repeatWithSeparator1(newline));

const shaping = (input: string) =>
  pipe(
    Syntax.parseString(grammer, input),
    Either.getOrThrow,
    Chunk.flatten,
    Chunk.partition((_, i) => i % 2 === 0)
  );

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      shaping(input),
      Tuple.mapBoth({
        onFirst: flow(Chunk.sort(Order.number)),
        onSecond: flow(Chunk.sort(Order.number)),
      }),
      ([right, left]) => Chunk.zip(right, left),
      Chunk.map(distance),
      sumChunk
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      shaping(input),
      Tuple.mapBoth({
        onFirst: (chunk) => histogram(chunk, Order.number),
        onSecond: (chunk) => histogram(chunk, Order.number),
      }),
      ([right, left]) =>
        pipe(
          HashMap.toEntries(left),
          Array.map(([k, v]) =>
            pipe(
              HashMap.get(right, k),
              Option.match({
                onNone: () => 0,
                onSome: (y) => k * v * y,
              })
            )
          )
        ),
      sumArray
    );
  });
