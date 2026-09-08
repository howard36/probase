import EditableStatement from "./editable-statement";
import Latex from "@/components/latex";
import type { Props } from "./types";
import { canEditProblem } from "@/lib/permissions";

export default function Statement(props: Props) {
  const { problem, permission, authors } = props;
  const canEdit = canEditProblem(problem, permission, authors);

  if (canEdit) {
    return (
      <EditableStatement
        problem={{ id: problem.id, statement: problem.statement }}
      />
    );
  } else {
    return <Latex>{`${problem.statement}`}</Latex>;
  }
}
