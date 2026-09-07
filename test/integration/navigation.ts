import { isNotFoundError } from "next/dist/client/components/not-found";
import {
  getURLFromRedirectError,
  isRedirectError,
} from "next/dist/client/components/redirect";
import { expect } from "vitest";

// `redirect()` and `notFound()` work by throwing. These helpers assert on that throw.

async function rejection(promise: Promise<unknown>): Promise<unknown> {
  return promise.then(
    (value) => {
      throw new Error(
        `Expected the action to throw, but it resolved with ${JSON.stringify(value)}`,
      );
    },
    (err: unknown) => err,
  );
}

export async function expectRedirect(
  promise: Promise<unknown>,
  path: string,
): Promise<void> {
  const err = await rejection(promise);
  if (!isRedirectError(err)) {
    throw err;
  }
  expect(getURLFromRedirectError(err)).toBe(path);
}

export async function expectNotFound(promise: Promise<unknown>): Promise<void> {
  const err = await rejection(promise);
  if (!isNotFoundError(err)) {
    throw err;
  }
}
