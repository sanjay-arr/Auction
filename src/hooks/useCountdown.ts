import { useState, useEffect, useRef } from "react";

export function useCountdown(endTime: string) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsExpired(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
      setIsExpired(false);
    };

    calculate();
    intervalRef.current = setInterval(calculate, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [endTime]);

  return { timeLeft, isExpired };
}
