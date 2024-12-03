import { Effect } from "effect";
import { describe } from "vitest";
import { effect } from '@effect/vitest';

const grammer = Effect.succeed('Hello, World!');

describe('Part 1', () => {
    effect('should return the correct answer', () => Effect.gen(function* () {
        
    }));
})