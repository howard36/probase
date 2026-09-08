import type { Subject } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { type Filter, PAGE_SIZE, applyFilter } from "@/lib/filter";

const noFilter: Filter = {
  subjects: [],
  search: "",
  archived: false,
  page: 1,
  unsolvedOnly: false,
};

let nextId = 1;
function problem(
  overrides: Partial<{
    title: string;
    statement: string;
    subject: Subject;
    isArchived: boolean;
  }> = {},
) {
  const id = nextId++;
  return {
    id,
    title: `Problem ${id}`,
    statement: `Statement ${id}`,
    subject: "Algebra" as Subject,
    isArchived: false,
    ...overrides,
  };
}

describe("applyFilter", () => {
  it("shows only unarchived problems by default, and only archived ones when asked", () => {
    const live = problem();
    const archived = problem({ isArchived: true });

    expect(applyFilter([live, archived], noFilter, []).page).toEqual([live]);
    expect(
      applyFilter([live, archived], { ...noFilter, archived: true }, []).page,
    ).toEqual([archived]);
  });

  it("keeps problems in any of the selected subjects", () => {
    const alg = problem({ subject: "Algebra" });
    const geo = problem({ subject: "Geometry" });
    const nt = problem({ subject: "NumberTheory" });

    expect(
      applyFilter(
        [alg, geo, nt],
        { ...noFilter, subjects: ["Geometry", "NumberTheory"] },
        [],
      ).page,
    ).toEqual([geo, nt]);
  });

  it("hides attempted problems when unsolvedOnly is set", () => {
    const tried = problem();
    const fresh = problem();

    expect(
      applyFilter([tried, fresh], { ...noFilter, unsolvedOnly: true }, [
        tried.id,
      ]).page,
    ).toEqual([fresh]);
    expect(applyFilter([tried, fresh], noFilter, [tried.id]).page).toEqual([
      tried,
      fresh,
    ]);
  });

  it("searches title and statement case-insensitively", () => {
    const byTitle = problem({ title: "Circumcenter fun" });
    const byStatement = problem({ statement: "Let $O$ be the CIRCUMCENTER." });
    const neither = problem();

    expect(
      applyFilter(
        [byTitle, byStatement, neither],
        { ...noFilter, search: "circum" },
        [],
      ).page,
    ).toEqual([byTitle, byStatement]);
  });

  it("pages the matches and reports the page count", () => {
    const problems = Array.from({ length: PAGE_SIZE + 5 }, () => problem());

    const first = applyFilter(problems, noFilter, []);
    expect(first.numPages).toBe(2);
    expect(first.page).toEqual(problems.slice(0, PAGE_SIZE));

    const second = applyFilter(problems, { ...noFilter, page: 2 }, []);
    expect(second.page).toEqual(problems.slice(PAGE_SIZE));
  });

  it("reports one page, not zero, when nothing matches", () => {
    const result = applyFilter([problem()], { ...noFilter, search: "zzz" }, []);
    expect(result).toEqual({ page: [], numPages: 1 });
  });
});
