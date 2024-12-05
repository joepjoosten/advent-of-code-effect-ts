export const invoke =
  <A extends string>(x: A) =>
  <B extends Array<unknown>>(ys: [...B]) =>
  <C>(z: Record<A, (...xs: B) => C>): C =>
    z[x](...ys);
