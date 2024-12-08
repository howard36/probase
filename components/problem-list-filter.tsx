import React from "react";
import {
  Collection,
  Permission,
  Subject,
  TestsolverType,
} from "@prisma/client";
import { Filter, filterToString } from "@/lib/filter";
import { usePathname, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    <div className="my-4 flex flex-row justify-between xl:flex-col xl:gap-y-4">
      <div className="flex flex-col gap-y-2">
        {allSubjects.map((subject) => (
          <div key={subject} className="flex items-center">
            <Checkbox
              id={`filter-subject-${subject}`}
              checked={filter.subjects.includes(subject)}
              onCheckedChange={() => toggleSubject(subject)}
            />
            <Label htmlFor={`filter-subject-${subject}`}>{subject}</Label>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        <Switch
          id="filter-archived"
          checked={filter.archived}
          onCheckedChange={toggleArchived}
        />
        <Label htmlFor="filter-archived">Archived</Label>
      </div>
      {collection.requireTestsolve &&
        permission?.testsolverType === TestsolverType.Serious && (
          <div className="flex items-center">
            <Switch
              id="filter-unsolved"
              checked={filter.unsolvedOnly}
              onCheckedChange={toggleUnsolvedOnly}
            />
            <Label htmlFor="filter-unsolved">Unsolved only</Label>
          </div>
        )}
    </div>
  );
}
