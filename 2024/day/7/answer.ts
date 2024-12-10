import * as Syntax from "@effect/parser/Syntax";
import { Effect, pipe } from "effect";
import { integer } from "../../../utils/parser";

export const newline = Syntax.char("\n");
export const line = pipe(integer, Syntax.zip(pipe(Syntax.zipRight(Syntax.char(":"), Syntax.char(" ")))), Syntax.zip(pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(' ')))));
export const grammer = pipe(line, Syntax.repeatWithSeparator1(newline));

export const part1 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
