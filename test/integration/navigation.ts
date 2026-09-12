import {
  getAccessFallbackHTTPStatus,
  isHTTPAccessFallbackError,
} from "next/dist/client/components/http-access-fallback/http-access-fallback";
import { getURLFromRedirectError } from "next/dist/client/components/redirect";
import { isRedirectError } from "next/dist/client/components/redirect-error";
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
  // Next 15 folds notFound(), forbidden() and unauthorized() into one error
  // type distinguished by HTTP status.
  if (!isHTTPAccessFallbackError(err)) {
    throw err;
  }
  expect(getAccessFallbackHTTPStatus(err)).toBe(404);
}
