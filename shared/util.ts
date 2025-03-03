/* eslint-disable import/prefer-default-export */
export function assertUnreachable(x: never): never {
  console.error("Unreachable code reached", x);
  throw new Error(x);
}
