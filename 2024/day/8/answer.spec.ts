import * as Syntax from "@effect/parser/Syntax";
import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { effect } from '@effect/vitest';
import { Effect, Either } from "effect";
import { describe, expect } from "vitest";
import { grammer, part1, part2 } from "./answer.js";

describe('year 2024 - day 8 - does the parser work?', () => {
    effect('should return the correct answer', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/8/part-1-snippet-1.txt');
        const parsedAndPrinted = Syntax.printString(grammer, Either.getOrThrow(Syntax.parseString(grammer, snippet)));
        expect(Either.getOrThrow(parsedAndPrinted) + "\n").toEqual(snippet);
    }).pipe(Effect.provide(NodeContext.layer)));
});

describe('year 2024 - day 8 - are the examples working?', () => {
    effect('part 1 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/8/part-1-snippet-1.txt');
        const result = yield* part1(snippet);
        expect(result).toEqual(14);
    }).pipe(Effect.provide(NodeContext.layer)));

    effect('part 2 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/8/part-1-snippet-1.txt');
        const result = yield* part2(snippet);
        expect(result).toEqual(34);
    }).pipe(Effect.provide(NodeContext.layer)));
})