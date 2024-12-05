import { Array, Chunk, HashMap, Option, Order, pipe } from "effect";


export const upsert = <Key, Value>(map: HashMap.HashMap<Key, Value>) => (key: Key, fn: (value: Option.Option<Value>) => Value) => pipe(
    HashMap.get(map, key),
    (value) => HashMap.set(map, key, fn(value))
);

export const distance = ([lhs, rhs]: [number, number]) => Math.abs(lhs - rhs);
export const histogram = <T>(chunk: Chunk.Chunk<T>, order: Order.Order<T>): HashMap.HashMap<T, number> => pipe(
    chunk,
    Chunk.sort(order),
    Chunk.reduce(HashMap.empty<T, number>(), (acc, x) => pipe(upsert(acc)(x, Option.match({ onNone: () => 1, onSome: (v) => v + 1 }))))
)
export const sumChunk = Chunk.reduce(0, (acc, x: number) => acc + x);
export const sumArray = Array.reduce(0, (acc, x: number) => acc + x);
export const productChunk = Chunk.reduce(1, (acc, x: number) => acc * x);
export const productArray = Array.reduce(1, (acc, x: number) => acc * x);