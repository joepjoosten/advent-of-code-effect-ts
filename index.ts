#! tsx --tsconfig tsconfig.json

import { Command, HelpDoc, Options, Span } from "@effect/cli";
import { isValidationError } from "@effect/cli/ValidationError";
import { FileSystem, HttpClient, HttpClientRequest } from "@effect/platform";
import { NodeContext, NodeHttpClient, NodeRuntime } from '@effect/platform-node';
import { load } from 'cheerio';
import { Config, Console, Effect, Layer, pipe } from 'effect';
import path from 'path';

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
        yield* getCached(`.${puzzle}/description.html`, getPuzzleDescription(puzzle, sessionCookie));
        yield* getCached(`.${puzzle}/input.txt`, getPuzzleInput(puzzle, sessionCookie));
    }
    yield* Console.log(`Generated files for ${year} puzzles`);
  })),
)

const aocCommand = (args: string[]) =>
  Command.run(
    pipe(
      Command.make('aoc'),
      Command.withSubcommands([generateCommand]),
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
