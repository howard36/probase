"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

interface CountdownTimerProps {
  deadline: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState("");
  // Read out by screen readers at a few milestones; the ticking time itself
  // is not announced every second.
  const [announcement, setAnnouncement] = useState("");
  const announced = useRef(new Set<string>());
  const router = useRouter();

  useEffect(() => {
    const updateTimer = () => {
      const currentTime = new Date();
      const difference = deadline.getTime() - currentTime.getTime();

      const announce = (message: string) => {
        if (!announced.current.has(message)) {
          announced.current.add(message);
          setAnnouncement(message);
        }
      };

      if (difference > 0) {
        const minutes = Math.floor(difference / (1000 * 60));
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${minutes}m ${seconds}s`);
        if (difference <= 60_000) {
          announce("1 minute left");
        } else if (difference <= 5 * 60_000) {
          announce("5 minutes left");
        }
      } else {
        setTimeLeft("Finished!");
        announce("Time is up");
        router.refresh();
      }
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [deadline, router]);

  return (
    <div>
      <div role="timer">Time remaining: {timeLeft}</div>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
};

export default CountdownTimer;
