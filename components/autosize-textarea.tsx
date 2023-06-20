import Latex from 'react-latex-next';
import { useState } from 'react';

// A textarea whose height always resizes to match the text inside it
export default function AutosizeTextarea({ props }) {
  let [height, setHeight] = useState(0);

  return (
    <textarea height={height} {...props}/>
  );
}
