import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { effect } from '@effect/vitest';
import { Effect } from "effect";
import { describe, expect } from "vitest";
import { detectMul, part1, part2 } from "./answer.js";

describe('year 2024 - day 3 - does the parser work?', () => {
    effect('should return the correct answer', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/3/snippet-1.txt');
        const muls = [...snippet.matchAll(detectMul)].map(([, lhs, rhs]) => [parseInt(lhs), parseInt(rhs)]);
        expect(muls).toEqual([[2,4], [5,5], [11,8], [8,5]]);
    }).pipe(Effect.provide(NodeContext.layer)));
});

describe('year 2024 - day 3 - are the examples working?', () => {
    effect('part 1 - snippet 1', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/3/part-1-snippet-1.txt');
        const result = yield* part1(snippet);
        expect(result).toEqual(161);
    }).pipe(Effect.provide(NodeContext.layer)));

    effect('part 2 - snippet 2', () => Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const snippet = yield* fs.readFileString('./2024/day/3/part-2-snippet-1.txt');
        const result = yield* part2(snippet);
        expect(result).toEqual(48);
    }).pipe(Effect.provide(NodeContext.layer)));
})