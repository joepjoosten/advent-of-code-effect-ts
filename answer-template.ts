export const answerTemplate = () => `import * as Syntax from "@effect/parser/Syntax";
import { Effect, pipe } from "effect";

export const grammer = pipe(Syntax.anyString, Syntax.repeatWithSeparator1(Syntax.char("\\n")));

export const part1 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
`

export const answerSpecTemplate = (year: number, day: number) => `import * as Syntax from "@effect/parser/Syntax";
import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { effect } from '@effect/vitest';
import { Effect, Either } from "effect";
import { describe, expect } from "vitest";
import { grammer, part1, part2 } from "./answer.js";

describe('year ${year} - day ${day} - does the parser work?', () => {
    effect('should return the correct answer', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./${year}/day/${day}/part-1-snippet-1.txt');
        const parsedAndPrinted = Syntax.printString(grammer, Either.getOrThrow(Syntax.parseString(grammer, snippet)));
        expect(Either.getOrThrow(parsedAndPrinted)).toEqual(snippet);
    }).pipe(Effect.provide(NodeContext.layer)));
});

describe('year ${year} - day ${day} - are the examples working?', () => {
    effect('part 1 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./${year}/day/${day}/part-1-snippet-1.txt');
        const result = yield* part1(snippet);
        expect(result).toEqual(undefined);
    }).pipe(Effect.provide(NodeContext.layer)));

    effect('part 2 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./${year}/day/${day}/part-1-snippet-1.txt');
        const result = yield* part2(snippet);
        expect(result).toEqual(undefined);
    }).pipe(Effect.provide(NodeContext.layer)));
})`;