import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

export default function Lightbulbs({ difficulty }: { difficulty: number }) {
  return (
    <>
      <div className="hidden sm:flex gap-x-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <FontAwesomeIcon
            key={value}
            icon={faLightbulb}
            className={clsx(
              "text-xl md:text-2xl",
              value <= difficulty ? "text-amber-400" : "text-slate-300",
            )}
          />
        ))}
      </div>
      <div className="flex sm:hidden gap-x-1.5 items-center">
        <FontAwesomeIcon
          icon={faLightbulb}
          className={"text-xl md:text-2xl text-amber-400"}
        />
        <span className="font-bold text-slate-500 text-lg leading-none">
          {difficulty}
        </span>
      </div>
    </>
  );
}
