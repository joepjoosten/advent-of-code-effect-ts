import { HashMap, Option, pipe } from "effect";

export const upsert = <Key, Value>(map: HashMap.HashMap<Key, Value>) => (key: Key, fn: (value: Option.Option<Value>) => Value) => pipe(
    HashMap.get(map, key),
    (value) => HashMap.set(map, key, fn(value))
);
