import EditableAnswer from "./editable-answer";
import Latex from "@/components/latex";
import type { Props } from "./types";
import { canEditProblem } from "@/lib/permissions";
import Label from "@/components/label";

export default function Answer(props: Props) {
  const { problem, permission, authors } = props;
  const canEdit = canEditProblem(problem, permission, authors);
  const label = <Label text="ANSWER" />;

  if (canEdit) {
    return (
      <EditableAnswer
        problem={{ id: problem.id, answer: problem.answer }}
        label={label}
      />
    );
  } else {
    return (
      <>
        {label}
        <Latex>{`${problem.answer}`}</Latex>
      </>
    );
  }
}
