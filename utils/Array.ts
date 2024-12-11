import { Array, HashMap, Iterable, Option, pipe } from "effect";
import { invoke } from "./Function.js";
import { upsert } from "./HashMap.js";

export const slice =
  (start: number) =>
  (end: number): (<A>(xs: Array<A>) => Array<A>) =>
    invoke("slice")([start, end]);

export const aperture =
  (n: number, step = 1) =>
  <A>(xs: Array<A>): Array<Array<A>> => {
    const go =
      (i: number) =>
      (ys: Array<Array<A>>): Array<Array<A>> =>
        i + n > xs.length ? ys : go(i + step)(Array.append(slice(i)(n + i)(xs))(ys));

    return n < 1 ? [] : go(0)([]);
  };

export const transpose = <T>(xs: Array<Array<T>>): Array<Array<T>> =>
  xs.length === 0
    ? []
    : pipe(
        xs[0],
        Array.map((_, i) => Array.map((ys) => ys[i])(xs))
      );

export const makeBy2d = <T>(width: number, height: number, f: ([x, y]: readonly [number, number]) => T): Array.NonEmptyArray<Array.NonEmptyArray<T>> =>
  Array.makeBy(height, (i) => Array.makeBy(width, (j) => f([i, j])));

export const height = <T>(xs: Array<Array<T>>) => xs.length;
export const width = <T>(xs: Array<Array<T>>) => xs[0].length;

export const getHorizontals = <T>(xs: Array<Array<T>>) => xs;
export const getVerticals = <T>(xs: Array<Array<T>>) => xs[0].map((_, i) => xs.map((ys) => ys[i]));

export const getLowerLeftDiagonals = <T>(xys: Array<Array<T>>, startWith = 0): Array<Array<T>> =>
  pipe(
    Array.range(startWith, xys.length - 1),
    Array.map((i) =>
      pipe(
        Array.range(0, Math.min(xys[0].length, xys.length - i) - 1),
        Array.map((j) => xys.at(i + j).at(j))
      )
    )
  );

export const leftToRightDiagonals = <T>(xys: Array<Array<T>>): Array<Array<T>> =>
  [
    ...getLowerLeftDiagonals(xys),
    ...getLowerLeftDiagonals(transpose(xys), 1),
  ];

export const rightToLeftDiagonals = <T>(xys: Array<Array<T>>): Array<Array<T>> => pipe(
  xys,
  Array.reverse,
  leftToRightDiagonals
)

export const histogram = <T>(xs: Iterable<T>): HashMap.HashMap<T, number> => pipe(
  xs,
  Iterable.reduce(HashMap.empty<T, number>(), (acc, x) => pipe(upsert(acc)(x, Option.match({ onNone: () => 1, onSome: (v) => v + 1 }))))
)

export const getXY = ([x, y]: readonly[number, number]) => <T>(xys: Array<Array<T>>): Option.Option<T> =>
  pipe(xys, Array.get(x), Option.flatMap(Array.get(y)));

export const setXY = <T>([x, y]: readonly[number, number], value: T) => (xys: Array<Array<T>>): Array<Array<T>> =>
  Array.modify(xys, x, (ys) => Array.modify(ys, y, () => value));

export const findAllIndexes = <T>(xys: Array<Array<T>>) => (predicate: (x: T) => boolean): Array<readonly [number, number]> => {
  const indexes: Array<readonly [number, number]> = [];
  for (let x = 0; x < xys.length; x++) {
    const ys = xys[x];
    for (let y = 0; y < ys.length; y++) {
      if (predicate(ys[y])) {
        indexes.push([x, y] as const);
      }
    }
  }
  return indexes;
}

export const findFirstIndex = <T>(xys: Array<Array<T>>) => (predicate: (x: T) => boolean): Option.Option<readonly [number, number]> => {
  for (let x = 0; x < xys.length; x++) {
    const ys = xys[x];
    for (let y = 0; y < ys.length; y++) {
      if (predicate(ys[y])) {
        return Option.some([x, y] as const);
      }
    }
  }
  return Option.none();
}