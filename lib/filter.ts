import { Subject } from "@prisma/client";

const allSubjects: Subject[] = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "NumberTheory",
];

export type Filter = {
  page: number;
  subjects: Subject[];
};

// TODO: allow arbitrary JSON as input
export function parseFilter(searchParams: {
  page?: string;
  subject?: string;
}): Filter {
  const page = parseInt(searchParams.page ?? "1", 10) || 1;
  const subjectString = searchParams.subject || "";
  const subjects = allSubjects.filter((subject) =>
    subjectString.toLowerCase().includes(subject[0].toLowerCase()),
  );
  return { page, subjects };
}

export function filterToString(filter: Filter): string {
  const queryParams = new URLSearchParams();
  if (filter.page !== undefined && filter.page !== 1) {
    queryParams.set("page", filter.page.toString());
  }
  if (filter.subjects !== undefined && filter.subjects.length > 0) {
    const subjectString = filter.subjects
      .map((s) => s[0].toLowerCase())
      .join("");
    queryParams.set("subject", subjectString);
  }
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
}
