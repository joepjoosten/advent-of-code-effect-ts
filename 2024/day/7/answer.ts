import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, Option, pipe } from "effect";
import { integer, parseInput, toArray } from "../../../utils/parser";
import { sumArray } from "../../../utils/utils";

export const newline = Syntax.char("\n");
export const line = pipe(
  integer,
  Syntax.zip(pipe(Syntax.zipRight(Syntax.char(":"), Syntax.char(" ")))),
  Syntax.zip(pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(" ")), toArray())),
  Syntax.transform(
    ([[test], numbers]) => ({ test, numbers }),
    ({ test, numbers }) => [[test, void 0], numbers] as const
  )
);
export const grammer = pipe(line, Syntax.repeatWithSeparator1(newline), toArray());

const isValid = (test: number, numbers: number[], ops: string[], index = 0, current = 0, sequence = ""): Option.Option<string> => {
  if (index === numbers.length && test === current) return Option.some(sequence);
  if (index > numbers.length - 1 || current > test) return Option.none();
  return pipe(
    Option.none(),
    Option.orElse(() => Array.contains(ops, '*') ? isValid(test, numbers, ops, index + 1, current * numbers[index], `${sequence} * ${numbers[index]}`) : Option.none()),
    Option.orElse(() => Array.contains(ops, '+') ? isValid(test, numbers, ops, index + 1, current + numbers[index], `${sequence} + ${numbers[index]}`) : Option.none()),
    Option.orElse(() => Array.contains(ops, '||') ? isValid(test, numbers, ops, index + 1, parseInt(`${current}${numbers[index]}`, 10), `${sequence}${numbers[index]}`) : Option.none())
  );
};

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      Array.filter(({ test, numbers }) =>
        Option.isSome(isValid(test, numbers, ['*', '+'], 1, Array.headNonEmpty(numbers), `${Array.headNonEmpty(numbers)}`))
      ),
      Array.map(({ test }) => test),
      sumArray
    );
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      Array.filter(({ test, numbers }) => Option.isSome(isValid(test, numbers, ['*', '+', '||'], 1, Array.headNonEmpty(numbers), `${Array.headNonEmpty(numbers)}`))),
      Array.map(({ test }) => test),
      sumArray
    );
  });
