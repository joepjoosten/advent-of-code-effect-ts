import { Array, pipe } from "effect";
import { invoke } from "./Function.js";

export const slice =
  (start: number) =>
  (end: number): (<A>(xs: Array<A>) => Array<A>) =>
    invoke("slice")([start, end]);

export const aperture =
  (n: number) =>
  <A>(xs: Array<A>): Array<Array<A>> => {
    const go =
      (i: number) =>
      (ys: Array<Array<A>>): Array<Array<A>> =>
        i + n > xs.length ? ys : go(i + 1)(Array.append(slice(i)(n + i)(xs))(ys));

    return n < 1 ? [] : go(0)([]);
  };

export const transpose = <T>(xs: Array<Array<T>>): Array<Array<T>> =>
  xs.length === 0 ? [] : pipe(xs[0], Array.map((_, i) => Array.map((ys) => ys[i])(xs)));

export const getHorizontalFromRectangle = <T>(input: Array<Array<T>>) => input;
export const getVerticalsFromRectangle = <T>(input: Array<Array<T>>) => input[0].map((_, i) => input.map((row) => row[i]));

export const getLowerLeftDiagonals = <T>(input: Array<Array<T>>): Array<Array<T>> =>
  pipe(
    Array.range(0, input.length - 1),
    Array.map(i =>
      pipe(
        Array.range(0, Math.min(input[0].length, input.length - i) - 1),
        Array.map(j => input.at(i + j).at(j))
      )
    )
  );

export const getDiagonals = <T>(input:  Array<Array<T>>) => [
  ...getLowerLeftDiagonals(input),
  ...getLowerLeftDiagonals(transpose(input)).slice(1),
  ...getLowerLeftDiagonals(input.map((row) => row.reverse())),
  ...getLowerLeftDiagonals(transpose(input.map((row) => row.reverse()))).slice(1),
]