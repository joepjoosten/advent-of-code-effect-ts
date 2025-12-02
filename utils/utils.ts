import { Array, Chunk } from "effect";

export const distance = ([lhs, rhs]: [number, number]) => Math.abs(lhs - rhs);
export const sumChunk = Chunk.reduce(0, (acc, x: number) => acc + x);
export const sumArray = Array.reduce(0, (acc, x: number) => acc + x);
export const productChunk = Chunk.reduce(1, (acc, x: number) => acc * x);
export const productArray = Array.reduce(1, (acc, x: number) => acc * x);
export const euclideanMod = (rhs: number) => (lhs: number) => ((lhs % rhs) + rhs) % rhs;
export const euclideanDiv = (a: number, b: number): number => a > 0 ? Math.floor(a / b) : Math.ceil(a / b);
export const logPipe = <T>(x: T): T => {
  console.log(x);
  return x;
};