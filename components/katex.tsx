import React from 'react';
import katex from 'katex';

function escapeHtml(unsafe: string) {
  return unsafe.replace(/&/g, "&amp;")
               .replace(/</g, "&lt;")
               .replace(/>/g, "&gt;")
               .replace(/"/g, "&quot;")
               .replace(/'/g, "&#039;");
}

function unescapeHtml(safe: string) {
  return safe.replace(/&amp;/g, "&")
             .replace(/&lt;/g, "<")
             .replace(/&gt;/g, ">")
             .replace(/&quot;/g, "\"")
             .replace(/&#039;/g, "'");
}

function parseAndRenderLatex(inputString: string) {
  const escapedString = escapeHtml(inputString);
  const tokens = escapedString.split(/(\$+)|([^$]+)/g).filter(Boolean);
  let isLatex = true;
  const renderedTokens = tokens.map(token => {
    isLatex = !isLatex;
    if (isLatex) {
      const latexString = unescapeHtml(token);
      try {
        console.log("rendering", latexString)
        const htmlString = katex.renderToString(latexString, {
          throwOnError: false,
        });
        return htmlString;
      } catch (e) {
        console.error('Failed to render LaTeX: ', e);
        return escapeHtml(token);
      }
    }
    return token;
  });
  return renderedTokens.join('');
}

const renderLatex = (input: string) => {
    let cursor = 0;
    let html = '';
    const regex = /\$(.*?)\$/g;  // Regex to match LaTeX expressions
    let result;

    // Loop through all matches
    while ((result = regex.exec(input)) !== null) {
        const [match, latex] = result;
        const index = result.index;

        // Append text before match
        html += escapeHtml(input.slice(cursor, index));

        // Render LaTeX and append
        try {
            html += katex.renderToString(latex, { throwOnError: false });
        } catch (e) {
            console.error('Failed to render LaTeX:', e);
            html += escapeHtml(match);  // Append original match if rendering fails
        }

        cursor = index + match.length;
    }

    // Append remaining text
    html += escapeHtml(input.slice(cursor));

    return html;
};

export default function Katex({ children }: { children: string }) {
  const renderedHtml = renderLatex(children);
  return <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />;
}
