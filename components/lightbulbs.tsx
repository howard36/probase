import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

export default function Lightbulbs({ difficulty }: { difficulty: number }) {
  return (
    <>
      <div className="flex items-center gap-x-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <FontAwesomeIcon
            key={value}
            icon={faLightbulb}
            className={cn("text-lg sm:text-xl md:text-2xl", {
              "text-amber-400": value <= difficulty,
              "text-slate-300": value > difficulty,
            })}
          />
        ))}
      </div>
    </>
  );
}
