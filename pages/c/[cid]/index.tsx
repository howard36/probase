import Head from 'next/head';
import Script from 'next/script';
import HomeCard from '@/components/home-card';
import clientPromise from '@/utils/mongodb';
import Layout from '@/components/layout';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render.min.js';
import Latex from 'react-latex-next'

export async function getServerSideProps({ params }) {
  const client = await clientPromise;
  const db = client.db();

  const contest = await db
    .collection("contests")
    .findOne({ cid: params.cid });

  // TODO: check if contest is null
  // TODO: filter only needed fields of contest

  const problems = await db
    .collection("problems")
    .find({ contest_id: contest._id })
    .project({ pid: 1, title: 1, statement: 1, subject: 1, _id: 0 })
    .toArray();

  console.log(katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}"));
  console.log(renderMathInElement);

  return {
    props: {
      contest: JSON.parse(JSON.stringify(contest)),
      problems,
    },
  };
}

export default function Contest({ contest, problems }) {
  return (
    <Layout title={contest.name}>
      {/* KaTeX */}
      <Script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.js" integrity="sha384-PwRUT/YqbnEjkZO0zZxNqcxACrXe+j766U2amXcgMg5457rve2Y7I6ZJSm2A0mS4" crossorigin="anonymous" onLoad={() => {console.log("Script has loaded");}}/>

      <Script src="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.js" onLoad={() => {
        console.log("script2");
        const options = {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "\\[", right: "\\]", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false}
          ]
        };
        renderMathInElement(document.body, options);
        console.log("script2 done");
      }} />

      {/*
      <Script onLoad={() => {console.log("script3"); console.log("script3 done");}}>{renderMathInElement(document.getElementById("problems")); console.log("inner script done");}</Script>
      */}
      <Script type="module">
        import renderMathInElement from "https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/contrib/auto-render.mjs";
        const prob = document.getElementById("problems");
        console.log(prob);
        //renderMathInElement(prob);
        console.log("script 4 rendered");
      </Script>

      <ul id="problems" className="px-16 py-16">
        <li>hi $1+2$? bye</li>
        {problems.map((problem) => (
          <HomeCard key={problem.pid} contest={contest} problem={problem}/>
        ))}
        <li dangerouslySetInnerHTML={{__html: katex.renderToString("c = \\pm\\sqrt{a^2 + b^2}")}}></li>
        <li dangerouslySetInnerHTML={{__html: render_problem("What is $$1+1$$?")}}></li>
        <li>{"What is \\begin{align} 1+2 \\end{align}? first"}</li>
        <li><Latex>{"What is \\begin{align} 1+2 \\end{align}? second"}</Latex></li>
      </ul>
    </Layout>
  );
}

function render_problem(problem_text) {
  return 'hi';
  const div = document.createElement("div");
  const text = document.createTextNode(problem_text);
  div.appendChild(text);
  renderMathInElement(div);
  console.log(div.innerHTML);
  return div.innerHTML;
}
