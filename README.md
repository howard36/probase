# Probase: A Math Problem Database
[Probase](https://www.probase.app) is an online collaborative database where you can store math problems. It's a tool for math contest organizers and problem writers to easily manage long lists of math problems in an organized way. You can upload any math questions you come up with, share them with others, testsolve other problems, and vote on which ones you think are best. It's an improved version of https://github.com/CMU-Math/probase (because I'm too much of a perfectionist to be satisfied with the first iteration).

I made Probase with the following design goals in mind:
1. A strong focus on UX and interaction design - the web interface should be really nice to use.
1. Written in React/Next.js (because I want to learn that stack)
1. Live preview when typing in LaTeX (or something like Notion where the math is rendered inline, and you can click on any expression to edit it)
1. Better search capabilities to easily find problems in a large database
    1. Ultimately, some kind of ML-powered search where each problem has an embedding vector used for nearest-neighbor search. But this requires AI to understand math problems sufficiently well.
1. Many of the features missing in Probase V1:
    1. Support for pictures (and Asymptote diagrams)
    1. Hidden spoilers
    1. Links between problems
    1. Automatic test creation
1. Customizable settings per contest, so different groups can configure Probase to fit their own needs (e.g. anonymous problem writers for the CMO committee)

I built Probase in the hopes that it would be useful to lots of people, so if you or someone you know is interested, please reach out!
