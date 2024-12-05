import { Chunk, pipe } from "effect";
import * as Syntax from "@effect/parser/Syntax";
import { char } from "@effect/parser/Regex";

const repeatChar = (
  char: string,
  charSyntax: Syntax.Syntax<string, Error, string, void>,
  times: number
): Syntax.Syntax<string, Error, string, void> =>
  times === 0
    ? charSyntax
    : repeatChar(
        char,
        Syntax.zipRight(Syntax.char(char), charSyntax),
        times - 1
      );
export const repeatedChar = (char: string, times: number) =>
  repeatChar(char, Syntax.char(char), times - 1);

export const toArray = <T>() =>
  Syntax.transform<Chunk.NonEmptyChunk<T>, [T, ...T[]]>(
    Chunk.toArray,
    Chunk.unsafeFromNonEmptyArray
  );
export const toInteger = Syntax.transform<string, number>(
  (x) => parseInt(x),
  String
);

export const integer = pipe(Syntax.digit, Syntax.repeat1, Syntax.captureString, toInteger);
