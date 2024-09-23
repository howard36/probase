import EditableTitle from "./editable-title";
import type { Props } from "./types";
import { canEditProblem } from "@/lib/permissions";

const subjectToTextColor = {
  Algebra: "text-blue-500",
  Combinatorics: "text-amber-500",
  Geometry: "text-green-500",
  NumberTheory: "text-red-500",
  ComputerScience: "text-cyan-500",
};

export default function Title(props: Props) {
  const { problem, collection, permission, authors } = props;
  const canEdit =
    collection.cid === "demo" || canEditProblem(problem, permission, authors);

  return (
    <h2 className="flex gap-x-1.5">
      <span className={subjectToTextColor[problem.subject]}>
        {problem.pid}.
      </span>
      <div className="text-slate-900 w-full">
        {canEdit ? <EditableTitle problem={problem} /> : problem.title}
      </div>
    </h2>
  );
}
