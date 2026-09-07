import { describe, expect, it } from "vitest";
import { type Filter, filterToString, parseFilter } from "@/lib/filter";

const emptyFilter: Filter = {
  subjects: [],
  search: "",
  archived: false,
  page: 1,
  unsolvedOnly: false,
};

describe("parseFilter", () => {
  it("returns the default filter for empty search params", () => {
    expect(parseFilter({})).toEqual(emptyFilter);
  });

  it("maps subject initials to subjects, in canonical order", () => {
    expect(parseFilter({ subject: "gca" }).subjects).toEqual([
      "Algebra",
      "Combinatorics",
      "Geometry",
    ]);
    expect(parseFilter({ subject: "n" }).subjects).toEqual(["NumberTheory"]);
  });

  it("accepts upper-case subject initials and ignores unknown letters", () => {
    expect(parseFilter({ subject: "XAz" }).subjects).toEqual(["Algebra"]);
  });

  it("only treats the literal string 'true' as a boolean flag", () => {
    expect(parseFilter({ archived: "true" }).archived).toBe(true);
    expect(parseFilter({ archived: "1" }).archived).toBe(false);
    expect(parseFilter({ archived: "TRUE" }).archived).toBe(false);
    expect(parseFilter({ unsolvedOnly: "true" }).unsolvedOnly).toBe(true);
    expect(parseFilter({ unsolvedOnly: "false" }).unsolvedOnly).toBe(false);
  });

  it("parses the page number", () => {
    expect(parseFilter({ page: "3" }).page).toBe(3);
    expect(parseFilter({ page: "07" }).page).toBe(7);
  });

  it("passes the search string through untouched", () => {
    expect(parseFilter({ search: "  Hello World " }).search).toBe(
      "  Hello World ",
    );
  });

  it("ignores repeated (array-valued) params", () => {
    expect(
      parseFilter({
        subject: ["a", "c"],
        search: ["x"],
        page: ["2"],
        archived: ["true"],
      }),
    ).toEqual(emptyFilter);
  });
});

describe("filterToString", () => {
  it("returns an empty string for the default filter", () => {
    expect(filterToString(emptyFilter)).toBe("");
  });

  it("omits page 1 but keeps other pages", () => {
    expect(filterToString({ ...emptyFilter, page: 1 })).toBe("");
    expect(filterToString({ ...emptyFilter, page: 2 })).toBe("?page=2");
  });

  it("encodes subjects as their lower-case initials", () => {
    expect(
      filterToString({
        ...emptyFilter,
        subjects: ["Combinatorics", "NumberTheory"],
      }),
    ).toBe("?subject=cn");
  });

  it("URL-encodes the search string", () => {
    expect(filterToString({ ...emptyFilter, search: "a & b" })).toBe(
      "?search=a+%26+b",
    );
  });

  it("includes every non-default field", () => {
    expect(
      filterToString({
        subjects: ["Algebra"],
        search: "roots",
        archived: true,
        page: 4,
        unsolvedOnly: true,
      }),
    ).toBe("?subject=a&search=roots&archived=true&page=4&unsolvedOnly=true");
  });
});

describe("round trip", () => {
  const cases: Filter[] = [
    emptyFilter,
    { ...emptyFilter, page: 12 },
    { ...emptyFilter, subjects: ["Algebra", "Geometry"] },
    { ...emptyFilter, search: "x^2 + y^2 = z^2" },
    { ...emptyFilter, archived: true, unsolvedOnly: true },
    {
      subjects: ["Algebra", "Combinatorics", "Geometry", "NumberTheory"],
      search: "wall of text",
      archived: true,
      page: 3,
      unsolvedOnly: true,
    },
  ];

  it.each(cases)(
    "parseFilter(filterToString(%o)) is the identity",
    (filter) => {
      const query = filterToString(filter);
      const params = Object.fromEntries(new URLSearchParams(query));
      expect(parseFilter(params)).toEqual(filter);
    },
  );
});
