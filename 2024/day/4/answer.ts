import * as Syntax from "@effect/parser/Syntax";
import { Effect, pipe } from "effect";

export const grammer = pipe(Syntax.anyString, Syntax.repeatWithSeparator1(Syntax.char("\n")));

export const part1 = (input: string) =>
  Effect.gen(function* () {
    Effect.fail("Not implemented");
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    Effect.fail("Not implemented");
  });
