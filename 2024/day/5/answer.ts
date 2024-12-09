import * as Syntax from "@effect/parser/Syntax";
import { Array, Effect, HashMap, Number, Order, pipe, Tuple } from "effect";
import { histogram, slice } from "../../../utils/Array";
import { integer, parseInput, repeatedChar, separatedBy, toArray } from "../../../utils/parser";
import { sumArray } from "../../../utils/utils";

const newline = Syntax.char("\n");
const doubleNewLine = repeatedChar('\n', 2)

const orderingRule = separatedBy(integer, Syntax.char('|'), integer);
const orderingRules = pipe(orderingRule, Syntax.repeatWithSeparator1(newline), toArray());
const update = pipe(integer, Syntax.repeatWithSeparator1(Syntax.char(",")), toArray());
const updates = pipe(update, Syntax.repeatWithSeparator1(newline), toArray());
export const grammer = separatedBy(orderingRules, doubleNewLine, updates)

const ruleEq = Tuple.getEquivalence(Number.Equivalence, Number.Equivalence);
const partition = (index: number) => <T>(xs: T[]) => [slice(0)(index)(xs), slice(index + 1)(xs.length)(xs)];
const interestingRule = (pages: number[]) => (rule: readonly [number, number]) => Array.every(rule, x => Array.contains(x)(pages));

const isValidUpdate = (rules: Array<readonly [number, number]>) => (pages: number[]) => pipe(
  Array.range(0, pages.length - 1),
  Array.flatMap(i => pipe(
    partition(i)(pages),
    ([before, after]) => [
      ...Array.map(before, x => [x, pages[i]] as const), 
      ...Array.map(after, x => [pages[i], x] as const)
    ]
  )),
  Array.every(pair => Array.containsWith(ruleEq)(rules, pair))
)

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      ([rules, updates]) => Array.filter(updates, pages => isValidUpdate(rules)(pages)),
      Array.map(update => update[Math.floor(update.length / 2)]),
      sumArray
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      ([rules, updates]) => [rules, Array.filter(updates, pages => !isValidUpdate(rules)(pages))] as const,
      ([rules, invalid]) => pipe(
        invalid,
        Array.map(pages => pipe(
          rules,
          Array.filter(interestingRule(pages)),
          Array.map(Tuple.getFirst),
          histogram,
          HashMap.toEntries,
          Array.sortWith(Tuple.getSecond, Order.reverse(Number.Order)),
          Array.map(Tuple.getFirst),
        )
      ),
      Array.map(update => update[Math.floor(update.length / 2)]),
      sumArray
    )
  );
});
