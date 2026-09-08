import { isValidElement, type ReactNode } from "react";

/**
 * Approximates the RSC payload Next.js would send to the browser for a page
 * element: server components (plain functions) are expanded until only host
 * elements and client components remain, and everything left, including all
 * the props handed to client components, is returned as plain data.
 *
 * In Vitest there is no real server/client boundary, so the caller lists the
 * client components. Anything not listed is treated as a server component
 * and rendered in place.
 */
export async function clientPayload(
  node: ReactNode,
  clientComponents: Set<unknown>,
): Promise<unknown> {
  if (Array.isArray(node)) {
    const out = [];
    for (const child of node as ReactNode[]) {
      out.push(await clientPayload(child, clientComponents));
    }
    return out;
  }
  if (!isValidElement(node)) {
    return node ?? null;
  }
  const { type, props } = node as { type: unknown; props: unknown };
  const record = props as Record<string, unknown>;

  if (typeof type === "function" && !clientComponents.has(type)) {
    const rendered = (await (type as (p: unknown) => unknown)(
      props,
    )) as ReactNode;
    return clientPayload(rendered, clientComponents);
  }

  const name =
    typeof type === "string"
      ? type
      : ((type as { displayName?: string; name?: string }).displayName ??
        (type as { name?: string }).name ??
        "component");
  const serialized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    serialized[key] =
      isValidElement(value) || Array.isArray(value)
        ? await clientPayload(value as ReactNode, clientComponents)
        : value;
  }
  return { $: name, props: serialized };
}
