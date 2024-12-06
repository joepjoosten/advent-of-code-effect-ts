#! tsx --tsconfig tsconfig.json

import { Command, HelpDoc, Options, Span } from "@effect/cli";
import { isValidationError } from "@effect/cli/ValidationError";
import { FileSystem, HttpClient, HttpClientRequest } from "@effect/platform";
import { NodeContext, NodeHttpClient, NodeRuntime } from '@effect/platform-node';
import { load } from 'cheerio';
import { Array, Config, Console, Effect, Layer, pipe } from 'effect';
import path from 'path';
import { answerSpecTemplate, answerTemplate } from "./answer-template.js";
import { globby } from 'globby';

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

const style = '<head><link rel="stylesheet" type="text/css" href="https://adventofcode.com/static/style.css"/></head>';
const getPuzzleDescription = (path: string, sessionCookie: string, part2: boolean) => pipe(
    Effect.gen(function* () {
        const client = (yield* HttpClient.HttpClient).pipe(HttpClient.filterStatusOk);
        return yield* pipe(
          HttpClientRequest.get(`https://adventofcode.com${path}`),
          HttpClientRequest.setHeader('Cookie', `session=${sessionCookie}`),
          client.execute,
          Effect.andThen(resp => resp.text),
          Effect.andThen(text => Effect.try(() => load(text))),
          Effect.andThen(($) => $('.day-desc').toArray().map(element => $(element).html())),
          Effect.andThen(parts => parts[part2 ? 1 : 0]),
          Effect.andThen(html => [style, html].join('\n')),
        );
      }),
    Effect.scoped,
  );

const getPuzzleExamples = (path: string, part2: boolean) => Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs.exists(`.${path}/description-part-${part2 ? 2 : 1}.html`);
    if(!exists) {
        yield* Effect.fail(`Description file not found for ${path}`);
    }
    const html = yield* fs.readFileString(`.${path}/description-part-${part2 ? 2 : 1}.html`);
    yield* pipe(
      Effect.try(() => load(html)),
      Effect.andThen(($) => Effect.try(() => $('pre > code').toArray().map(element => $(element).text()))),
      Effect.andThen(Array.map((example, index) => fs.writeFileString(`.${path}/part-${part2 ? 2 : 1}-snippet-${index + 1}.txt`, example))),
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
          Effect.andThen(text => Effect.try(() => load(text))),
          Effect.andThen(($) => $(`.calendar > a[href]`).toArray().map(element => [
            element.attribs.href, 
            $(element).hasClass('calendar-complete') || $(element).hasClass('calendar-verycomplete')
          ] as const))
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
    for(const [puzzle, part2] of puzzles) {
        const day = parseInt(puzzle.split('/').pop()!);
        yield* getCached(`.${puzzle}/description-part-1.html`, getPuzzleDescription(puzzle, sessionCookie, false));
        yield* getPuzzleExamples(puzzle, false);
        if(part2) { 
          yield* getCached(`.${puzzle}/description-part-2.html`, getPuzzleDescription(`${puzzle}`, sessionCookie, true));
          yield* getPuzzleExamples(puzzle, true);
        }
        yield* getCached(`.${puzzle}/input.txt`, getPuzzleInput(puzzle, sessionCookie));
        yield* getCached(`.${puzzle}/answer.ts`, Effect.succeed(answerTemplate()));
        yield* getCached(`.${puzzle}/answer.spec.ts`, Effect.succeed(answerSpecTemplate(year, day)));
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

const cleanCommand = pipe(
  Command.make('clean'),
  Command.withHandler(() => Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* pipe(
      Effect.tryPromise(async () => await globby(['**/description-part-1.html', '**/description-part-2.html', '**/part-1-snippet-*.txt', '**/part-2-snippet-*.txt', '**/input.txt'], { ignore: ['node_modules'] })),
      Effect.andThen(Array.map(file => fs.remove(file))),
      Effect.andThen(Effect.all),
    );
  }))
)

const aocCommand = (args: string[]) =>
  Command.run(
    pipe(
      Command.make('aoc'),
      Command.withSubcommands([generateCommand, runDayCommand, cleanCommand]),
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
