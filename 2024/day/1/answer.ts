import { Effect } from "effect";

const grammer = Effect.succeed('Hello, World!');

export const part1 = (input: string) => Effect.gen(function* () {
    const parsed = yield* grammer;
    Effect.fail('Not implemented');
});

export const part2 = (input: string) => Effect.gen(function* () {
    const parsed = yield* grammer;
    Effect.fail('Not implemented');
});