import { Subject } from "@prisma/client";

const allSubjects: Subject[] = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "NumberTheory",
];

export type Filter = {
  subjects: Subject[];
  search: string;
  archived: boolean;
  page: number;
};

export function parseFilter(searchParams: {
  [key: string]: string | string[] | undefined;
}): Filter {
  const subjectString =
    typeof searchParams.subject === "string" ? searchParams.subject : "";
  const subjects = allSubjects.filter((subject) =>
    subjectString.toLowerCase().includes(subject[0].toLowerCase()),
  );
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const archived =
    typeof searchParams.archived === "string" &&
    searchParams.archived === "true";
  const page =
    typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) : 1;
  return { subjects, search, archived, page };
}

// TODO: escape special characters
export function filterToString(filter: Filter): string {
  const queryParams = new URLSearchParams();
  if (filter.subjects !== undefined && filter.subjects.length > 0) {
    const subjectString = filter.subjects
      .map((s) => s[0].toLowerCase())
      .join("");
    queryParams.set("subject", subjectString);
  }
  if (filter.search !== "") {
    queryParams.set("search", filter.search);
  }
  if (filter.archived) {
    queryParams.set("archived", "true");
  }
  if (filter.page !== undefined && filter.page !== 1) {
    queryParams.set("page", filter.page.toString());
  }
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
}
