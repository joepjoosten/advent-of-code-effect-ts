import * as Syntax from "@effect/parser/Syntax";
import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { effect } from '@effect/vitest';
import { Chunk, Effect, Either } from "effect";
import { describe, expect } from "vitest";
import { grammer, isAlwaysDecreasing, isAlwaysIncreasing, part1, part2 } from "./answer.js";

describe('year 2024 - day 2 - does the parser work?', () => {
    effect('should return the correct answer', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/2/snippet-1.txt');
        const parsedAndPrinted = Syntax.printString(grammer, Either.getOrThrow(Syntax.parseString(grammer, snippet)));
        expect(Either.getOrThrow(parsedAndPrinted)+"\n").toEqual(snippet);
    }).pipe(Effect.provide(NodeContext.layer)));
});

describe('year 2024 - day 2 - are the examples working?', () => {
    effect('part 1 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/2/snippet-1.txt');
        const result = yield* part1(snippet);
        expect(result).toEqual(2);
    }).pipe(Effect.provide(NodeContext.layer)));

    effect('part 2 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/2/snippet-1.txt');
        const result = yield* part2(snippet);
        expect(result).toEqual(4);
    }).pipe(Effect.provide(NodeContext.layer)));
})

describe('fun', () => {
    effect('isAlwaysIncreasing', () => Effect.gen(function* () {
        expect(isAlwaysIncreasing(1)(Chunk.unsafeFromNonEmptyArray([1, 2, 3, 4]))).toEqual(true);
        expect(isAlwaysIncreasing(1)(Chunk.unsafeFromNonEmptyArray([1, 3, 2, 4]))).toEqual(true);
        expect(isAlwaysIncreasing(1)(Chunk.unsafeFromNonEmptyArray([5, 3, 2, 7]))).toEqual(false);
        expect(isAlwaysDecreasing(1)(Chunk.unsafeFromNonEmptyArray([8, 6, 4, 4, 1]))).toEqual(true);
        expect(isAlwaysIncreasing(1)(Chunk.unsafeFromNonEmptyArray([1, 3, 2, 4, 5]))).toEqual(true);
    }));
})