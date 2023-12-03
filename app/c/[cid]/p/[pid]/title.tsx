import EditableTitle from "./editable-title";
import Latex from "@/components/latex";
import type { Props } from "./types";
import { canEditProblem } from "@/utils/permissions";

export default function Title(props: Props) {
  const { problem, collection, permission, authors } = props;
  const canEdit =
    collection.cid === "demo" || canEditProblem(problem, permission, authors);

  if (canEdit) {
    return <EditableTitle problem={problem} />;
  } else {
    return <Latex>{`${problem.title}`}</Latex>;
  }
}
