import { Array, Chunk } from "effect";

export const distance = ([lhs, rhs]: [number, number]) => Math.abs(lhs - rhs);
export const sumChunk = Chunk.reduce(0, (acc, x: number) => acc + x);
export const sumArray = Array.reduce(0, (acc, x: number) => acc + x);
export const productChunk = Chunk.reduce(1, (acc, x: number) => acc * x);
export const productArray = Array.reduce(1, (acc, x: number) => acc * x);