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