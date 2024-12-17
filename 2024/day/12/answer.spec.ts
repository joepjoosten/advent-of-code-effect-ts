import * as Syntax from "@effect/parser/Syntax";
import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { effect } from '@effect/vitest';
import { Effect, Either } from "effect";
import { describe, expect } from "vitest";
import { grammer, part1, part2 } from "./answer.js";

describe('year 2024 - day 12 - does the parser work?', () => {
    effect('should return the correct answer', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/12/part-1-snippet-1.txt');
        const parsedAndPrinted = Syntax.printString(grammer, Either.getOrThrow(Syntax.parseString(grammer, snippet)));
        expect(Either.getOrThrow(parsedAndPrinted) + "\n").toEqual(snippet);
    }).pipe(Effect.provide(NodeContext.layer)));
});

describe('year 2024 - day 12 - are the examples working?', () => {
    effect('part 1 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/12/part-1-snippet-4.txt');
        const result = yield* part1(snippet);
        expect(result).toEqual(1930);
    }).pipe(Effect.provide(NodeContext.layer)));

    effect('part 2 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/12/part-1-snippet-4.txt');
        const result = yield* part2(snippet);
        expect(result).toEqual(1206);
    }).pipe(Effect.provide(NodeContext.layer)));
})