import React from "react";
import { Subject } from "@prisma/client";
import { Filter, filterToString } from "@/lib/filter";
import { usePathname, useRouter } from "next/navigation";

const allSubjects: Subject[] = [
  "Algebra",
  "Combinatorics",
  "Geometry",
  "NumberTheory",
];

export function ProblemListFilter({
  filter,
  setFilter,
}: {
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleSubject = (subject: Subject) => {
    const newSubjects = filter.subjects.includes(subject)
      ? filter.subjects.filter((s) => s !== subject)
      : [...filter.subjects, subject].sort();
    const newFilter = { ...filter, subjects: newSubjects };
    setFilter(newFilter);
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  const toggleArchived = () => {
    const newFilter = { ...filter, archived: !filter.archived };
    setFilter(newFilter);
    const newParams = filterToString(newFilter);
    router.replace(`${pathname}${newParams}`, { scroll: false });
  };

  return (
    <div className="mb-4 flex flex-row xl:flex-col justify-between">
      <div className="form-control">
        {allSubjects.map((subject) => (
          <label key={subject} className="label cursor-pointer justify-start">
            <input
              type="checkbox"
              checked={filter.subjects.includes(subject)}
              onChange={() => toggleSubject(subject)}
              className="checkbox checkbox-primary [--chkfg:white]"
            />
            <span className="label-text ml-2 text-sm font-medium text-slate-600">
              {subject}
            </span>
          </label>
        ))}
      </div>
      <div className="ml-auto xl:ml-0 form-control">
        <label className="label cursor-pointer justify-start gap-x-2">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={filter.archived}
            onChange={toggleArchived}
          />
          <span className="text-sm font-medium text-slate-600 whitespace-nowrap label-text">
            Show archived
          </span>
        </label>
      </div>
    </div>
  );
}
