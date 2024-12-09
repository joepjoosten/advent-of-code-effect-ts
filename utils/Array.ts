import { Array, pipe } from "effect";
import { invoke } from "./Function.js";

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

export const getHorizontals = <T>(input: Array<Array<T>>) => input;
export const getVerticals = <T>(input: Array<Array<T>>) => input[0].map((_, i) => input.map((row) => row[i]));

export const getLowerLeftDiagonals = <T>(input: Array<Array<T>>, startWith = 0): Array<Array<T>> =>
  pipe(
    Array.range(startWith, input.length - 1),
    Array.map((i) =>
      pipe(
        Array.range(0, Math.min(input[0].length, input.length - i) - 1),
        Array.map((j) => input.at(i + j).at(j))
      )
    )
  );

export const leftToRightDiagonals = <T>(input: Array<Array<T>>): Array<Array<T>> =>
  [
    ...getLowerLeftDiagonals(input),
    ...getLowerLeftDiagonals(transpose(input), 1),
  ];

export const rightToLeftDiagonals = <T>(input: Array<Array<T>>): Array<Array<T>> => pipe(
  input,
  Array.reverse,
  leftToRightDiagonals
)