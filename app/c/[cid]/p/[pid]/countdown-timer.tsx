'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface CountdownTimerProps {
  deadline: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const router = useRouter();

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = new Date();
      const difference = deadline.getTime() - currentTime.getTime();

      if (difference > 0) {
        const minutes = Math.floor(difference / (1000 * 60));
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Finished!");
        router.refresh();
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return <div>Time remaining: {timeLeft}</div>;
};

export default CountdownTimer;
