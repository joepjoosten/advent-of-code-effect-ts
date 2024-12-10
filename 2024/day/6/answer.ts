import * as Syntax from "@effect/parser/Syntax";
import { Array, Console, Effect, Either, HashSet, Match, Option, pipe } from "effect";
import { parseInput, toArray } from "../../../utils/parser";
import { findAllIndexes, findFirstIndex, getXY, setXY } from "../../../utils/Array";

const newline = Syntax.char("\n");
const guardChars = ["<", "^", ">", "v"];
const emptyChar = ".";
const obstacleChar = "#";
const pathChar = "X"
const cell = Syntax.charIn([...guardChars, emptyChar, obstacleChar, pathChar]);
export const grammer = pipe(cell, Syntax.repeat1, toArray(), Syntax.repeatWithSeparator1(newline), toArray());

type Position = readonly [number, number];

const up = ([x, y]: Position) => [x - 1, y] as const;
const down = ([x, y]: Position) => [x + 1, y] as const;
const left = ([x, y]: Position) => [x, y - 1] as const;
const right = ([x, y]: Position) => [x, y + 1] as const;
const next = (guard: string, pos: Position) => pipe(
  Match.value(guard),
  Match.when(">", () => right(pos)),
  Match.when("^", () => up(pos)),
  Match.when("<", () => left(pos)),
  Match.when("v", () => down(pos)),
  Match.exhaustive
)
const turn90cw = (current: string) => pipe(
  Match.value(current),
  Match.when(">", () => "v"),
  Match.when("^", () => ">"),
  Match.when("<", () => "^"),
  Match.when("v", () => "<"),
  Match.exhaustive
)

const walkBoard = (initialBoard: Array<Array<string>>): Option.Option<Array<Array<string>>> => {
    let visited = HashSet.empty<string>();
    let board = initialBoard;
    let guardPosition = findFirstIndex(board)((x) => guardChars.includes(x));
    let guard = Option.flatMap(guardPosition, (pos) => getXY(pos)(board));
    while(Option.isSome(guardPosition) && Option.isSome(guard)) {
      const hasVisisted = HashSet.has(visited, `${guardPosition.value[0]},${guardPosition.value[1]},${guard.value}`);
      if(hasVisisted) return Option.none();
      visited = HashSet.add(visited, `${guardPosition.value[0]},${guardPosition.value[1]},${guard.value}`);
      
      const nextPos = next(guard.value, guardPosition.value);
      const nextCell = getXY(nextPos)(board);
      if(Option.isSome(nextCell)) {
        switch(nextCell.value) {
          case pathChar:
          case emptyChar: {
            board = pipe(board, setXY(guardPosition.value, pathChar), setXY(nextPos, guard.value));
            break;
          }
          case obstacleChar: {
            board = pipe(board, setXY(guardPosition.value, turn90cw(guard.value)))
            break;
          }
        }
      } else {
        board = pipe(board, setXY(guardPosition.value, pathChar));
      }
      guardPosition = findFirstIndex(board)((x) => guardChars.includes(x));
      guard = Option.flatMap(guardPosition, (pos) => getXY(pos)(board));
    }
    return Option.some(board);
  }

export const part1 = (input: string) =>
  Effect.gen(function* () {
    const endBoard = Option.getOrThrow(walkBoard(parseInput(grammer, input)));
    return findAllIndexes(endBoard)((x) => x === pathChar).length;
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    const originalBoard = parseInput(grammer, input);
    const initialGuardPos = findFirstIndex(originalBoard)((x) => guardChars.includes(x))
    const endBoard = Option.getOrThrow(walkBoard(parseInput(grammer, input)));
    const possibleObstruction = findAllIndexes(endBoard)((x) => x === pathChar);
    const boards: Array<Option.Option<Array<Array<string>>>> = [];
    for (const [x, y] of possibleObstruction) {
      if(Option.isSome(initialGuardPos) && initialGuardPos.value[0] === x && initialGuardPos.value[1] === y) continue;
      boards.push(walkBoard(pipe(originalBoard, setXY([x, y], obstacleChar))));
    }
    return pipe(
      boards,
      Array.filter(Option.isNone),
      Array.length
    );
  });
