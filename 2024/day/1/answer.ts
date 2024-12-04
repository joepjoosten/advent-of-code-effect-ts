import { Effect, pipe, Console } from "effect";
import * as Syntax from "@effect/parser/Syntax";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { FileSystem } from "@effect/platform";

const space = Syntax.char(' ');
const newline = Syntax.char('\n');
const integer = pipe(Syntax.digit, Syntax.repeat1, Syntax.captureString, Syntax.transform<string, number>((x) => parseInt(x), String));
const line = Syntax.repeatWithSeparator1(integer, space);
const grammer = pipe(line, Syntax.repeatWithSeparator1(newline))


export const part1 = (input: string) => Effect.gen(function* () {
    const parsed = Syntax.parseStringWith(grammer, input, "stack-safe");
    yield* Console.log(JSON.stringify(parsed));
});

export const part2 = (input: string) => Effect.gen(function* () {
    Effect.fail('Not implemented');
});

const main = Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const input = yield* fs.readFileString('./2024/day/1/input.txt');
    yield* pipe(part1(input), Effect.ignoreLogged);
    yield* pipe(part2(input), Effect.ignoreLogged);
}).pipe(Effect.provide(NodeContext.layer));
  
NodeRuntime.runMain(main);