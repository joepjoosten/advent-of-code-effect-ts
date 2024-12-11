import * as Syntax from "@effect/parser/Syntax";
import { Effect, pipe } from "effect";
import { toInteger } from "../../../utils/parser";

const height = pipe(Syntax.digit, toInteger);
export const grammer = pipe(Syntax.anyString, Syntax.repeatWithSeparator1(Syntax.char("\n")));

export const part1 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
