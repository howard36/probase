import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Collection, Permission } from "@prisma/client";
import {
  Suspense,
  startTransition,
  use,
  useState,
  type ReactNode,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProblemListSidebar } from "@/components/problem-list-sidebar";
import { type Filter, filterToString, parseFilter } from "@/lib/filter";

// A stand-in for the Next.js router that behaves like the real one where it
// matters: `replace` starts a transition, and the page keeps showing the old
// filter until the new one has loaded, which the test decides.
interface Navigation {
  url: string;
  land: () => void;
}
let navigations: Navigation[] = [];
let startNavigation: (url: string) => void = () => {};
let showFilter: (filter: Filter) => void = () => {};

vi.mock("next/navigation", () => ({
  usePathname: () => "/c/demo",
  useRouter: () => ({
    replace: (url: string) => startNavigation(url),
    push: vi.fn(),
  }),
}));

const collection = {
  id: 1,
  cid: "demo",
  name: "Demo",
  requireTestsolve: false,
} as Collection;

const permission = {
  id: 1,
  userId: "u",
  collectionId: 1,
  accessLevel: "ViewOnly",
  createdAt: new Date(),
  testsolverType: null,
  seriousTestsolverStartedAt: null,
} as Permission;

const emptyFilter: Filter = {
  subjects: [],
  search: "",
  archived: false,
  page: 1,
  unsolvedOnly: false,
};

interface Route {
  filter: Filter;
  loaded: Promise<void> | null;
}

function Loaded({ route }: { route: Route }): ReactNode {
  if (route.loaded !== null) {
    use(route.loaded);
  }
  return (
    <>
      <output aria-label="Loaded filter">{filterToString(route.filter)}</output>
      <ProblemListSidebar
        collection={collection}
        permission={permission}
        filter={route.filter}
      />
    </>
  );
}

function CollectionPage() {
  const [route, setRoute] = useState<Route>({
    filter: emptyFilter,
    loaded: null,
  });
  startNavigation = (url) => {
    let land = () => {};
    const loaded = new Promise<void>((resolve) => (land = resolve));
    navigations.push({ url, land });
    const params = Object.fromEntries(new URL(url, "http://x").searchParams);
    startTransition(() => setRoute({ filter: parseFilter(params), loaded }));
  };
  // A navigation the collection page did not start: a page link, Back.
  showFilter = (filter) => setRoute({ filter, loaded: null });
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Loaded route={route} />
    </Suspense>
  );
}

const searchBox = () => screen.getByPlaceholderText("Search");
const subject = (name: string) => screen.getByRole("checkbox", { name });
const loadedFilter = () => screen.getByLabelText("Loaded filter").textContent;

// A navigation suspends the page, so every step that can start one runs in
// an awaited act(), as React requires for components that suspend.
async function step(action: () => Promise<unknown> | void) {
  await act(async () => {
    await action();
  });
}

/** Lets the search box's pause-in-typing delay run out. */
const pauseTyping = () =>
  step(() => new Promise((resolve) => setTimeout(resolve, 400)));

const landAll = () =>
  step(() => {
    for (const navigation of navigations) {
      navigation.land();
    }
  });

beforeEach(() => {
  navigations = [];
});

describe("collection search and filters while the list is loading", () => {
  it("keeps typing while a search is still loading", async () => {
    const user = userEvent.setup();
    render(<CollectionPage />);

    await step(() => user.type(searchBox(), "fil"));
    await pauseTyping();
    expect(navigations.map((n) => n.url)).toEqual(["/c/demo?search=fil"]);
    await step(() => user.type(searchBox(), "ler"));

    expect(searchBox()).toHaveValue("filler");
    expect(loadedFilter()).toBe("");
    await pauseTyping();
    expect(navigations.at(-1)?.url).toBe("/c/demo?search=filler");

    await landAll();
    expect(loadedFilter()).toBe("?search=filler");
    expect(searchBox()).toHaveValue("filler");
  });

  it("keeps a second click made while the first one is loading", async () => {
    const user = userEvent.setup();
    render(<CollectionPage />);

    await step(() => user.click(subject("Algebra")));
    await step(() => user.click(subject("Geometry")));

    expect(navigations.map((n) => n.url)).toEqual([
      "/c/demo?subject=a",
      "/c/demo?subject=ag",
    ]);
    expect(loadedFilter()).toBe("");
    expect(subject("Algebra")).toBeChecked();
    expect(subject("Geometry")).toBeChecked();

    await landAll();
    expect(loadedFilter()).toBe("?subject=ag");
    expect(subject("Algebra")).toBeChecked();
    expect(subject("Geometry")).toBeChecked();
  });

  it("follows a navigation it did not start once nothing is loading", async () => {
    const user = userEvent.setup();
    render(<CollectionPage />);
    await step(() => user.click(subject("Algebra")));
    await landAll();
    expect(loadedFilter()).toBe("?subject=a");

    await step(() => showFilter({ ...emptyFilter, search: "back" }));

    expect(loadedFilter()).toBe("?search=back");
    expect(searchBox()).toHaveValue("back");
    expect(subject("Algebra")).not.toBeChecked();
  });

  it("follows a navigation that wins over one of its own still loading", async () => {
    const user = userEvent.setup();
    render(<CollectionPage />);
    await step(() => user.click(subject("Algebra")));

    // Back, say, before the Algebra list has loaded: the later navigation wins.
    await step(() => showFilter({ ...emptyFilter, search: "back" }));
    await landAll();

    expect(loadedFilter()).toBe("?search=back");
    expect(searchBox()).toHaveValue("back");
    expect(subject("Algebra")).not.toBeChecked();
  });
});
