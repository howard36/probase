import { Lightbulb } from 'lucide-react';

export default function Lightbulbs({
  difficulty
}: {
  difficulty: number
}) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((value) => (
        <Lightbulb 
          key={value}
          className={value <= difficulty ? "text-amber-500" : "text-slate-400"} 
        />
      ))}
    </div>
  );
}
