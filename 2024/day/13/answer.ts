import * as Syntax from "@effect/parser/Syntax";
import { Effect, pipe } from "effect";
import { integer } from "../../../utils/parser";
import { xml } from "cheerio/dist/commonjs/static";

const newline = Syntax.char("\n");
const press = (directoin: "X" | "Y") => pipe(Syntax.string(`${directoin}+`, `${directoin}+`), Syntax.zip(integer), Syntax.transform(([, x]) => x, (x) => [`${directoin}+`, x] as const)); 
const location = (location: "X" | "Y") => pipe(Syntax.string(`${location}=`, `${location}: `), Syntax.zip(integer), Syntax.transform(([, x]) => x, (x) => [`${location}=`, x] as const));
const x = press("X");
const y = press("Y");
const button = (button: "A" | "B") => pipe(Syntax.string(`Button ${button}: `, `Button ${button}: `), Syntax.zip(pipe(x, Syntax.zip(y))), Syntax.transform(([, [x, y]]) => ({ x, y }), ({ x, y }) => [`Button ${button}: `, [x, y]] as const));
const prize = pipe(Syntax.string("Prize: ", "Prize: "),  Syntax.zip(pipe(x, Syntax.zip(y))), Syntax.transform(([, [x, y]]) => ({x, y}), ({x, y}) => ["Prize: ", [x, y]] as const));
export const grammer = pipe(Syntax.zipLeft(button("A"), newline), Syntax.zip(Syntax.zipLeft(button("B"), newline)), Syntax.zip());

export const part1 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });

export const part2 = (input: string) =>
  Effect.gen(function* () {
    yield* Effect.fail("Not implemented");
  });
