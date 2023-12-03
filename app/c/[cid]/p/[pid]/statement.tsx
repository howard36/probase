import EditableStatement from "./editable-statement";
import Latex from "@/components/latex";
import type { Props } from "./types";
import { canEditProblem } from "@/utils/permissions";

export default function Statement(props: Props) {
  const { problem, collection, permission, authors } = props;
  const canEdit =
    collection.cid === "demo" || canEditProblem(problem, permission, authors);

  if (canEdit) {
    return <EditableStatement problem={problem} />;
  } else {
    return <Latex>{`${problem.statement}`}</Latex>;
  }
}
