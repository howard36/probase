import EditableSolution from "./editable-solution";
import Latex from "@/components/latex";
import type {
  AuthorProps,
  CollectionProps,
  PermissionProps,
  SolutionProps,
} from "./types";
import { canEditSolution } from "@/utils/permissions";
import Label from "@/components/label";

export default function Solution({
  solution,
  collection,
  permission,
  authors,
}: {
  solution: SolutionProps;
  collection: CollectionProps;
  permission: PermissionProps;
  authors: AuthorProps[];
}) {
  const canEdit =
    collection.cid === "demo" || canEditSolution(solution, permission, authors);
  const label = <Label text="SOLUTION" />;

  if (canEdit) {
    return <EditableSolution solution={solution} label={label} />;
  } else {
    return (
      <>
        {label}
        <Latex>{`${solution.text}`}</Latex>
      </>
    );
  }
}
