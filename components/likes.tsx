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
  insideLink = false,
}: {
  problem: ProblemWithLikes;
  userId: string;
  /**
   * On a problem card, which is itself a link, a button would be an
   * interactive element inside another. There the heart stays a pointer
   * shortcut; keyboard users like a problem from its page.
   */
  insideLink?: boolean;
}) {
  const serverNumLikes = problem.likes.length;
  const serverLiked = problem.likes.some((like) => like.userId === userId);
  const [numLikes, setNumLikes] = useState(serverNumLikes);
  const [liked, setLiked] = useState(serverLiked);

  // Follow the server when a refresh brings new likes (someone else's, or
  // this user's from another tab).
  const [seen, setSeen] = useState({ serverNumLikes, serverLiked });
  if (
    seen.serverNumLikes !== serverNumLikes ||
    seen.serverLiked !== serverLiked
  ) {
    setSeen({ serverNumLikes, serverLiked });
    setNumLikes(serverNumLikes);
    setLiked(serverLiked);
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
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

  const heart = (
    <>
      <FontAwesomeIcon
        icon={faHeart}
        aria-hidden
        className={cn("text-lg sm:text-xl md:text-2xl", {
          "text-rose-400 group-hover:text-rose-500": liked,
          "text-slate-400 group-hover:text-slate-500": !liked,
        })}
      />
      <span className="text-lg font-bold leading-none text-slate-500 group-hover:text-slate-600 md:text-xl">
        {numLikes}
      </span>
    </>
  );

  if (insideLink) {
    return (
      <span
        className="group flex items-center gap-x-1.5"
        onClick={handleClick}
        aria-label={`${numLikes} ${numLikes === 1 ? "like" : "likes"}`}
      >
        {heart}
      </span>
    );
  }
  return (
    <button
      type="button"
      className="group flex items-center gap-x-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={`Like (${numLikes})`}
    >
      {heart}
    </button>
  );
}
