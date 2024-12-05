#! tsx --tsconfig tsconfig.json

import { Command, HelpDoc, Options, Span } from "@effect/cli";
import { isValidationError } from "@effect/cli/ValidationError";
import { FileSystem, HttpClient, HttpClientRequest } from "@effect/platform";
import { NodeContext, NodeHttpClient, NodeRuntime } from '@effect/platform-node';
import { load } from 'cheerio';
import { Array, Config, Console, Effect, Layer, pipe } from 'effect';
import path from 'path';
import { answerSpecTemplate, answerTemplate } from "./answer-template.js";

const getCached = (filename: string, fetch: Effect.Effect<string, any, HttpClient.HttpClient>) => Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(filename);
    if(!exists) {
        const result = yield* fetch;
        yield* fs.makeDirectory(path.dirname(filename), { recursive: true });
        yield* fs.writeFileString(filename, result);
    }
    return yield* fs.readFileString(filename);
});

const getPuzzleDescription = (path: string, sessionCookie: string) => pipe(
    Effect.gen(function* () {
        const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);
        return yield* pipe(
          HttpClientRequest.get(`https://adventofcode.com${path}`),
          HttpClientRequest.setHeader('Cookie', `session=${sessionCookie}`),
          client.execute,
          Effect.andThen(resp => resp.text),
          Effect.andThen(text => Effect.try(() => load(text)(`article`).toString()))
        );
      }),
    Effect.scoped,
  );

const getPuzzleExamples = (path: string) => Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(`.${path}/description.html`);
    if(!exists) {
        yield* Effect.fail(`Description file not found for ${path}`);
    }
    const html = yield* fs.readFileString(`.${path}/description.html`);
    yield* pipe(
      Effect.try(() => load(html)),
      Effect.andThen(($) => Effect.try(() => $('pre > code').toArray().map(element => $(element).text()))),
      Effect.andThen(Array.map((example, index) => fs.writeFileString(`.${path}/snippet-${index + 1}.txt`, example))),
      Effect.andThen(Effect.all)
    )
});

const getPuzzleInput = (path: string, sessionCookie: string) => pipe(
    Effect.gen(function* () {
        const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);
        return yield* pipe(
          HttpClientRequest.get(`https://adventofcode.com${path}/input`),
          HttpClientRequest.setHeader('Cookie', `session=${sessionCookie}`),
          client.execute,
          Effect.tap(Effect.logTrace),
          Effect.andThen(resp => resp.text),
        );
      }),
    Effect.scoped,
  );

const getAvailablePuzzles = (year: number, sessionCookie: string) => pipe(
    Effect.gen(function* () {
        const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);
        return yield* pipe(
          HttpClientRequest.get(`https://adventofcode.com/${year}`),
          HttpClientRequest.setHeader('Cookie', `session=${sessionCookie}`),
          client.execute,
          Effect.andThen(resp => resp.text),
          Effect.andThen(text => Effect.try(() => load(text)(`a[href]`).toArray().map(a => a.attribs.href).filter(href => href.startsWith(`/${year}/day/`)))),
        );
      }),
    Effect.scoped,
  );

const year = Options.integer('year').pipe(
  Options.withAlias('y'),
  Options.withDescription('The year of the Advent of Code puzzles'),
  Options.withFallbackConfig(Config.integer('YEAR')),
  Options.withDefault(2024),
);

const day = Options.integer('day').pipe(
  Options.withAlias('d'),
  Options.withDescription('The day of the puzzle'),
);

const sessionCookie = Options.text('session-cookie').pipe(
  Options.withAlias('s'),
  Options.withDescription('The session cookie for the Advent of Code website'),
  Options.withFallbackConfig(Config.string('SESSION_COOKIE')),
);

const generateCommand = pipe(
  Command.make('generate', { year, sessionCookie }),
  Command.withHandler(({ year, sessionCookie }) => Effect.gen(function* () {
    
    const puzzles = yield* getAvailablePuzzles(year, sessionCookie);
    yield* Console.log(`Found ${puzzles.length} puzzles for ${year}, generating files...`);
    for(const puzzle of puzzles) {
        const day = parseInt(puzzle.split('/').pop());
        yield* getCached(`.${puzzle}/description.html`, getPuzzleDescription(puzzle, sessionCookie));
        yield* getCached(`.${puzzle}/input.txt`, getPuzzleInput(puzzle, sessionCookie));
        yield* getCached(`.${puzzle}/answer.ts`, Effect.succeed(answerTemplate()));
        yield* getCached(`.${puzzle}/answer.spec.ts`, Effect.succeed(answerSpecTemplate(year, day)));
        yield* getPuzzleExamples(puzzle);
    }
    yield* Console.log(`Generated files for ${year} puzzles`);
  })),
)

type AnswerModule = { part1: (input: string) => Effect.Effect<any>, part2: (input: string) => Effect.Effect<any> };
const logAnswer = (day: number, part: number) => (answer: unknown) => Console.log(`Answer to day ${day}, part ${part}: \x1b[33m${answer}\x1b[37m`)
const runDayCommand = pipe(
  Command.make('run', { year, day }),
  Command.withHandler(({ year, day }) => Effect.gen(function* () {
    const answerModule: AnswerModule = yield* Effect.tryPromise(() => import(`./${year}/day/${day}/answer`));
    const fs = yield* FileSystem.FileSystem;
    const input = yield* fs.readFileString(`./${year}/day/${day}/input.txt`);
    yield* pipe(answerModule.part1(input), Effect.andThen(logAnswer(day, 1)), Effect.ignoreLogged);
    yield* pipe(answerModule.part2(input), Effect.andThen(logAnswer(day, 2)), Effect.ignoreLogged);
  })),
)

const aocCommand = (args: string[]) =>
  Command.run(
    pipe(
      Command.make('aoc'),
      Command.withSubcommands([generateCommand, runDayCommand]),
    ),
    {
      name: 'Advent of Code',
      summary: Span.text('generate, run, and test solutions for Advent of Code puzzles'),
      version: 'v1.0.0',
    },
  )(args).pipe(
    Effect.catchIf(isValidationError, (e) => printDocs(HelpDoc.p(Span.error(HelpDoc.getSpan(e.error))))),
    Effect.catchAll((e) => printDocs(HelpDoc.p(Span.error(e.message)))),
  );

const printDocs = (doc: HelpDoc.HelpDoc) => Console.log(HelpDoc.toAnsiText(doc));

const main = pipe(
  Effect.sync(() => process.argv),
  Effect.andThen(aocCommand),
  Effect.provide(Layer.mergeAll(NodeContext.layer, NodeHttpClient.layer)),
);

NodeRuntime.runMain(main);
