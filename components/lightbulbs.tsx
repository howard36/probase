import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

export default function Lightbulbs({ difficulty }: { difficulty: number }) {
  return (
    <>
      <div className="flex items-center gap-x-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <FontAwesomeIcon
            key={value}
            icon={faLightbulb}
            className={clsx(
              "text-lg sm:text-xl md:text-2xl",
              value <= difficulty ? "text-amber-400" : "text-slate-300",
            )}
          />
        ))}
      </div>
    </>
  );
}
