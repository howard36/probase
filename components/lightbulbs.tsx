import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLightbulb } from '@fortawesome/free-solid-svg-icons'

export default function Lightbulbs({
  difficulty
}: {
  difficulty: number
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <FontAwesomeIcon
          key={value}
          icon={faLightbulb}
          size="xl"
          className={value <= difficulty ? "text-amber-500" : "text-slate-400"} 
        />
      ))}
    </div>
  );
}
