"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { likeProblem } from "../app/c/[cid]/p/[pid]/actions";
import { wrapAction } from "@/lib/server-actions";
import clsx from "clsx";

interface ProblemWithLikes {
  id: number;
  likes: { userId: string }[];
}

export default function Likes({
  problem,
  userId,
}: {
  problem: ProblemWithLikes;
  userId: string;
}) {
  const [numLikes, setNumLikes] = useState(problem.likes.length);
  const [liked, setLiked] = useState(
    problem.likes.some((like) => like.userId === userId),
  );

  const action = wrapAction(likeProblem);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (liked) {
      setNumLikes(numLikes - 1);
    } else {
      setNumLikes(numLikes + 1);
    }
    setLiked(!liked);
    action(problem.id, !liked);
  };

  return (
    <div className="flex gap-x-1.5 items-center group" onClick={handleClick}>
      <FontAwesomeIcon
        icon={faHeart}
        className={clsx(
          "text-xl md:text-2xl",
          liked
            ? "text-rose-400 group-hover:text-rose-500"
            : "text-slate-400 group-hover:text-slate-500",
        )}
      />
      <span className="font-bold text-slate-500 group-hover:text-slate-600 text-lg leading-none">
        {numLikes}
      </span>
    </div>
  );
}
