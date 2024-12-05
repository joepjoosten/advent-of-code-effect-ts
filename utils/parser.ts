import { Chunk } from "effect";
import * as Syntax from "@effect/parser/Syntax";

export const toArray = <T>() => Syntax.transform<Chunk.NonEmptyChunk<T>, [T, ...T[]]>(Chunk.toArray, Chunk.unsafeFromNonEmptyArray);
export const toInteger = Syntax.transform<string, number>((x) => parseInt(x), String)