"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { likeProblem } from "../app/c/[cid]/p/[pid]/actions";
import { wrapAction } from "@/lib/server-actions";
import { cn } from "@/lib/utils";

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

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const wasLiked = liked;
    const previousNumLikes = numLikes;
    setNumLikes(wasLiked ? numLikes - 1 : numLikes + 1);
    setLiked(!wasLiked);
    // Undo the optimistic update if the server rejects it.
    const revert = () => {
      setLiked(wasLiked);
      setNumLikes(previousNumLikes);
    };
    wrapAction(likeProblem, undefined, revert)(problem.id, !wasLiked);
  };

  return (
    <div className="group flex items-center gap-x-1.5" onClick={handleClick}>
      <FontAwesomeIcon
        icon={faHeart}
        className={cn("text-lg sm:text-xl md:text-2xl", {
          "text-rose-400 group-hover:text-rose-500": liked,
          "text-slate-400 group-hover:text-slate-500": !liked,
        })}
      />
      <span className="text-lg font-bold leading-none text-slate-500 group-hover:text-slate-600 md:text-xl">
        {numLikes}
      </span>
    </div>
  );
}
