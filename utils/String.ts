export const indexesOf = (needle: string) => (s: string) => [...s.matchAll(new RegExp(needle, "g"))].map((x) => x.index);
