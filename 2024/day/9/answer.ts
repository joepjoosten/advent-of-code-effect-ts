import * as Syntax from "@effect/parser/Syntax";
import { Array, Console, Effect, Option, pipe } from "effect";
import { parseInput, toArray, toInteger } from "../../../utils/parser";

const emptyChar = ".";
const fileLength = pipe(Syntax.digit, toInteger);
export const grammer = pipe(fileLength, Syntax.repeat1, toArray());

type DiskMap = Array<number>;
type Layout = Array<"." | number>;

const diskLayout = (diskMap: DiskMap) =>
  Array.reduce(diskMap, [] as Layout, (acc, fileLength, pos) =>
    Array.appendAll(
      acc,
      fileLength === 0 ? [] : Array.makeBy(fileLength, () => pos % 2 === 1 ? emptyChar : pos / 2)
    )
  );

const swapInPlace = (lhs: number, rhs: number, layout: Layout) => {
  const temp = layout[lhs];
  layout[lhs] = layout[rhs];
  layout[rhs] = temp;
}

const swapSliceInPlace = (lhs: number, rhs: number, length: number, layout: Layout) => {
  for (let i = 0; i < length; i++) {
    swapInPlace(lhs + i, rhs + i, layout);
  }
}

const fileIdStartAndLength = (layout: Layout, fileId: number) => pipe(
  Array.findFirstIndex(layout, (x) => x === fileId),
  Option.flatMap((start) => pipe(
    Array.findLastIndex(layout, (x) => x === fileId),
    Option.map(end => [start, end - start + 1] as const)
  )
));

const firstSequenceOfEmptyBefore = (layout: Layout, length: number, before: number): Option.Option<number> => {
  let i=0;
  let sequenceStart = 0;
  while(i < before) {
    if(i - sequenceStart === length) {
      return Option.some(sequenceStart);
    }
    if(layout[i] !== emptyChar) {
      sequenceStart = i + 1;
    }
    i++
  }
  return Option.none();
};

const leftMostEmptyIndex = (layout: Layout) => Array.findFirstIndex(layout, (x) => x === emptyChar);
const rightMostNonEmptyIndex = (layout: Layout) => Array.findLastIndex(layout, (x) => x !== emptyChar);

const compactDiskLayout = (layout: Layout) => {
  let leftMostEmpty = leftMostEmptyIndex(layout);
  let rightMostNonEmpty = rightMostNonEmptyIndex(layout);
  while (Option.isSome(leftMostEmpty) && Option.isSome(rightMostNonEmpty) && leftMostEmpty.value < rightMostNonEmpty.value) {
    swapInPlace(leftMostEmpty.value, rightMostNonEmpty.value, layout);
    leftMostEmpty = leftMostEmptyIndex(layout);
    rightMostNonEmpty = rightMostNonEmptyIndex(layout);
  }
}

const defragment = (layout: Layout) => {
  let currentFileId = layout[Option.getOrThrow(rightMostNonEmptyIndex(layout))] as number;
  while (currentFileId >= 0) {
    const [start, length] = Option.getOrThrow(fileIdStartAndLength(layout, currentFileId));
    const emptyHoleIndex = firstSequenceOfEmptyBefore(layout, length, start);
    if (Option.isSome(emptyHoleIndex)) {
      swapSliceInPlace(start, emptyHoleIndex.value, length, layout);
    }
    currentFileId--;
  }
}

const checksum = (layout: Layout) => Array.reduce(layout, 0, (acc, x, i) => acc + (x === emptyChar ? 0 :i * x));

export const part1 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      diskLayout,
      (layout) => {
        compactDiskLayout(layout);
        return layout;
      },
      checksum
    )
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    return pipe(
      parseInput(grammer, input),
      diskLayout,
      (layout) => {
        defragment(layout);
        return layout;
      },
      checksum
    )
  });
