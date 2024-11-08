import React from "react";
import {
  Collection,
  Permission,
  Subject,
  TestsolverType,
} from "@prisma/client";
import { Filter, filterToString } from "@/lib/filter";
import { usePathname, useRouter } from "next/navigation";

const allSubjects: Subject[] = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "NumberTheory",
];

export function ProblemListFilter({
  collection,
  permission,
  filter,
}: {
  collection: Collection;
  permission: Permission | null;
  filter: Filter;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleSubject = (subject: Subject) => {
    const newSubjects = filter.subjects.includes(subject)
      ? filter.subjects.filter((s) => s !== subject)
      : [...filter.subjects, subject].sort();
    const newFilter = { ...filter, subjects: newSubjects };
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  const toggleArchived = () => {
    const newFilter = { ...filter, archived: !filter.archived };
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  const toggleUnsolvedOnly = () => {
    const newFilter = { ...filter, unsolvedOnly: !filter.unsolvedOnly };
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  return (
    <div className="mb-4 flex flex-row justify-between xl:flex-col">
      <div className="form-control">
        {allSubjects.map((subject) => (
          <label key={subject} className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={filter.subjects.includes(subject)}
              onChange={() => toggleSubject(subject)}
              className="checkbox-primary checkbox [--chkfg:white]"
            />
            <span className="label-text ml-2 text-sm font-medium text-slate-600">
              {subject}
            </span>
          </label>
        ))}
      </div>
      <div className="form-control ml-auto xl:ml-0">
        <label className="label cursor-pointer justify-start gap-x-2">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={filter.archived}
            onChange={toggleArchived}
          />
          <span className="label-text whitespace-nowrap text-sm font-medium text-slate-600">
            Archived
          </span>
        </label>
      </div>
      {collection.requireTestsolve &&
        permission?.testsolverType === TestsolverType.Serious && (
          <div className="form-control ml-auto xl:ml-0">
            <label className="label cursor-pointer justify-start gap-x-2">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={filter.unsolvedOnly}
                onChange={toggleUnsolvedOnly}
              />
              <span className="label-text whitespace-nowrap text-sm font-medium text-slate-600">
                Unsolved only
              </span>
            </label>
          </div>
        )}
    </div>
  );
}
