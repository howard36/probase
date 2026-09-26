/**
 * A field's caption. With `htmlFor` it labels that field for assistive
 * technology too; with `id` a field can point at it (aria-labelledby).
 */
export default function Label({
  text,
  htmlFor,
  id,
}: {
  text: string;
  htmlFor?: string;
  id?: string;
}) {
  const className = "mb-2 block text-sm font-bold text-slate-500";
  return htmlFor !== undefined ? (
    <label htmlFor={htmlFor} id={id} className={className}>
      {text}
    </label>
  ) : (
    <p id={id} className={className}>
      {text}
    </p>
  );
}
