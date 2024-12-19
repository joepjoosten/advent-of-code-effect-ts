import { Array, Chunk, Either, pipe } from "effect";
import * as Syntax from "@effect/parser/Syntax";

export const parseInput = <T, Error>(grammer: Syntax.Syntax<string, Error, string, T>, input: string) => pipe(
  Syntax.parseString(grammer, input),
  Either.getOrThrow,
);

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

export const separatedBy = <X, Y>(lhs: Syntax.Syntax<string, string | Error, string, X>, sep: Syntax.Syntax<string, string | Error, string, void>, rhs: Syntax.Syntax<string, string | Error, string, Y>) => pipe(
  lhs,
  Syntax.zip(sep),
  Syntax.zip(rhs),
  Syntax.transform<readonly [readonly [X, unknown], Y], readonly [X, Y]>(
      ([[x], y]) => [x, y] as const,
      ([x, y]) => [[x, void 0], y] as const
    )
)


export function chain2<A, B>(a: Syntax.Syntax<string, string, string, A>, b: Syntax.Syntax<string, string, string, B>) {
  return pipe(a, Syntax.zip(b), Syntax.transform(([a, b]) => [a, b] as const, ([a, b]) => [a, b] as const));
}
export function chain3<A, B, C>(a: Syntax.Syntax<string, string, string, A>, b: Syntax.Syntax<string, string, string, B>, c: Syntax.Syntax<string, string, string, C>) {
  return pipe(a, Syntax.zip(b), Syntax.zip(c), Syntax.transform(([[a, b], c]) => [a, b, c] as const, ([a, b, c]) => [[a, b], c] as const));
}

const test = chain3(Syntax.digit, Syntax.digit, Syntax.digit);

// Type to represent the tuple of Syntax types
type SyntaxTuple<T extends any[]> = {
  [K in keyof T]: Syntax.Syntax<string, string, string, T[K]>
}

// Helper type to create nested pairs for the input transformation
type NestedPairs<T extends any[]> = T extends []
  ? never
  : T extends [infer Only]
  ? Only
  : T extends [infer First, infer Second]
  ? [First, Second]
  : T extends [infer First, ...infer Rest]
  ? [First, NestedPairs<Rest>]
  : never;

// Helper type to create flat tuples for the output transformation
type FlatTuple<T extends any[]> = T extends []
  ? never
  : T extends [infer Only]
  ? [Only]
  : T extends any[]
  ? [...T]
  : never;

// Main chain function that can take any number of arguments
export function chain<T extends any[]>(...syntaxes: SyntaxTuple<T>) {
  if (syntaxes.length === 0) {
    throw new Error("At least one syntax is required");
  }
  if (syntaxes.length === 1) {
    return syntaxes[0];
  }

  // Recursive helper function to combine syntaxes
  const combineRecursive = <U extends any[]>(
    items: SyntaxTuple<U>
  ): Syntax.Syntax<string, string, string, any> => {
    if (items.length === 2) {
      return pipe(
        items[0],
        Syntax.zip(items[1]),
        Syntax.transform(
          ([a, b]) => [a, b] as const,
          ([a, b]) => [a, b] as const
        )
      );
    }

    const [first, ...rest] = items;
    return pipe(
      first,
      Syntax.zip(combineRecursive(rest as any)),
      Syntax.transform(
        ([head, tail]: [any, any]): FlatTuple<U> => 
          Array.isArray(tail) ? [head, ...tail] : [head, tail],
        (flat: FlatTuple<U>): NestedPairs<U> => {
          if (flat.length === 2) return [flat[0], flat[1]] as any;
          return [flat[0], createNestedPairs(flat.slice(1))] as any;
        }
      )
    );
  };

  return combineRecursive(syntaxes);
}

// Helper function to create nested pairs from a flat array
function createNestedPairs<T extends any[]>(arr: T): NestedPairs<T> {
  if (arr.length === 1) return arr[0] as any;
  if (arr.length === 2) return [arr[0], arr[1]] as any;
  return [arr[0], createNestedPairs(arr.slice(1))] as any;
}