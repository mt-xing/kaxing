/* eslint-disable import/prefer-default-export */
export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable ${x}`);
}
