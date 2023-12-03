'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react';
import { useRouter } from 'next/navigation'

interface ProblemWithLikes {
  id: number;
  likes: { userId: string }[];
}

export default function Likes({
  problem,
  userId,
}: {
  problem: ProblemWithLikes
  userId: string
}) {
  const [numLikes, setNumLikes] = useState(problem.likes.length);
  const [liked, setLiked] = useState(problem.likes.some(like => like.userId === userId));
  const router = useRouter();

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
    router.refresh();
  };

  return (
    <div className="space-x-1.5 group" onClick={handleClick}>
      <FontAwesomeIcon icon={faHeart} size="xl" className={liked ? "text-rose-400 group-hover:text-rose-500" : "text-slate-400 group-hover:text-slate-500"}/>
      <span className="font-semibold text-slate-500 group-hover:text-slate-600 text-lg">{numLikes}</span>
    </div>
  );
}
