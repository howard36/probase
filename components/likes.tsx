'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { ProblemProps } from '../app/c/[cid]/types';
import { useState } from 'react';

export default function Likes({
  problem,
  userId,
}: {
  problem: ProblemProps
  userId: string
}) {
  const [numLikes, setNumLikes] = useState(problem.likes.length);
  const [liked, setLiked] = useState(problem.likes.some(like => like.userId === userId));

  const handleClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (liked) {
      setNumLikes(numLikes - 1);
    } else {
      setNumLikes(numLikes + 1);
    }
    setLiked(!liked);

    await fetch(`/api/problems/${problem.id}/like`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        like: !liked,
      }),
    });
  };

  return (
    <div className="space-x-1.5 group" onClick={handleClick}>
      <FontAwesomeIcon icon={faHeart} size="xl" className={liked ? "text-rose-400 group-hover:text-rose-500" : "text-slate-400 group-hover:text-slate-500"}/>
      <span className="font-semibold text-slate-500 group-hover:text-slate-600 text-lg">{numLikes}</span>
    </div>
  );
}
