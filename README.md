# Probase

Probase is an online math contest platform, aiming to be the Codeforces for math. It's where contest creators can design, host, and run their own contests effortlessly, and where participants can compete from anywhere in the world. The goal is to make math contests more accessible, frequent, and enjoyable for everyone involved.

Right now (as of Jan 2024), Probase is still in the early stages, about 5% implemented and 95% future goals. What's currently ready is a collaborative space for problem writers and testsolvers to brainstorm, create, and polish their problem proposals. Check out the demo [here](https://probase.app/c/demo). The rest are my plans to turn Probase into a full-fledged online math contest hub, which you can read below. I'm still cooking up these plans, so expect some changes over time.

## Vision

### Primary goal: Expand Interest in Math Contests

**Part 1:** Make it easier for organizers to run math contests, and for students to participate in them, by building the software and infrastructure that enables them to do so. The goal is to increase the number of contests held each year and boost participation rates.

- Pain points with the current system:
  - **Limited School Participation:** Even popular contests like the AMC aren't held in most schools, and finding a different location can be a hassle. On Probase, you'll be able to register for any contest with a single click.
  - **Cost Barriers:** Participating in contests like HMMT and ARML can be prohibitively expensive, with significant travel costs. Even local contests incur costs for printing and shipping physical booklets. By hosting contests online, we can make it free for everyone involved.
  - **Contest Management:** In-person contests involve a lot of logistics, like getting proctors and classrooms. Probase's online platform will automate most of the work, so contest creators can focus on problem-writing.
    - I already have a system to manage problem proposals, with features like testsolving, comments, and upvotes. Currently used by CMIMC and OTIS.
  - **Mock Contest Engagement:** Many AoPS users pour effort into creating high-quality mocks, only to upload their problems as a PDF with no way for others to take it as a timed contest. Because of this, mocks aren't seen as "real" contests, and get less interest. Typically, around 10-50 people actually try the questions - a small fraction of what it could be.
    - Codeforces has _thousands_ of participants each contest, despite a smaller user base. My initial goal isn't to match those numbers, but to start a positive feedback loop: more contests hosted on Probase should draw in more users, and increased participation will attract more contest creators.
    - We should also remove age restrictions and allow all participants, whether in middle school and younger or college and older. The online contests won't be tied to your school, so there's no reason to keep these restrictions.

**Part 2:** Make math contests as fun as possible. We'll design the contest format to maximize enjoyment, and maybe influence the larger community towards doing math contests for fun (instead of - for example - doing it for college admissions, or the kind of toxic environment from an overly cutthroat and competitive culture)

- **Contest Format:** We have the freedom to design an online contest format optimized for fun, breaking away from traditional in-person conventions. Here are some key features for short-answer contests:
  - **Instant feedback:** Probase will give immediate confirmation after submitting an answer. This eliminates the long wait for scores
  - **Multiple attempts:** Contestants can try again if their first answer is incorrect
    - In-person contests require a single attempt, because once your answer sheet gets mailed back, you can't make changes.
    - But this is too harsh on small mistakes: you get a zero even if you solved most of the problem correctly
    - Instead, wrong submissions should get a time penalty (used in tiebreaker, see below). 5-minute penalty in fast AMC-type contests, 20 minutes in slower AIME-type contests
    - Limit of 10 resubmissions per problem, to prevent spam-guessing
    - In general, I think persistence and trying again after failure is a good life-skill that math contests should teach
  - **Tiebreak by time:** If two people tied with $n$ problems correct, favor the person who got to $n$ solves first
    - This lets you run contests with fewer questions, without worrying about ties (but too few questions leads to too much emphasis on speed)
  - **Live Leaderboard:** Inspired by HMMT Guts, a real-time leaderboard makes the contest more dynamic and exciting.
  - **Division system:** div1 / div2 / div3 for hard, medium, and easy contests
    - Being stuck with zero solves on a hard contest isn't fun
    - Being bored by problems that are too easy isn't fun either
  - **Technical Note:** Only supporting short-answer contests for now, because we need computer autograding. Might expand to proof-based contests in the future. Computational problems can still be extremely hard (see HMMT Feb)
- **Social aspect:** It's more fun to do math contests with friends, even if they're at different skill levels. Probase should encourage this sort of friendly competition, even if the online format can't capture the full social experience of going to ARML.

### Secondary goal: Support Anyone Aiming to Improve Their Math Skills

These future plans are currently out of scope. They'll only be a priority once the above contest system has been implemented.

- **Problem Database:**
  - Build a collection of problems from a variety of contests.
  - Emphasis on good search features and high quality solutions to learn from
  - Similar to the AoPS Contest Collections, or AoPS Wiki
- **Solution Tracker:**
  - Allow users to track and share their solutions to any problem in the above database.
  - Similar to [VON](https://github.com/vEnhance/von/).
- **Training Tool:**
  - A system that automatically suggests new practice problems for you.
  - You can request problems in a specific subject or difficulty range.
  - Similar to Alcumus, https://amctrivial.com, or https://www.amctrainer.com

## Development Setup

### 1. Clone the repository and install dependencies

```
git clone https://github.com/howard36/probase.git
cd probase
npm install
```

### 2. Set up a PostgreSQL database. Here's a rough overview of the steps involved:

1. Download and install Postgres
2. Define the initial configuration
3. Start the postgres daemon
4. [Optional] Create a user and password (alternatively, use the default `postgres` user created in step 2)
5. Create a database: `createdb probase` (you can pick any name, this example uses `probase`)

Note that these steps are OS-dependent. If you're having trouble getting this set up, I recommend searching online and following a guide.

### 3. Initialize the `.env.local` file

```
cp .env.example .env.local
```

You'll want to manually edit some of the variables in `.env.local`:

- Replace both `DATABASE_URL` and `DIRECT_URL` with your Postgres connection string. This depends on the username, password, hostname, port, and database name chosen during the Postgres setup above.
- Replace `NEXTAUTH_SECRET` with a [random password](https://www.random.org/passwords/?num=1&len=32&format=html&rnd=new).

### 4. Run database migrations

```
npx prisma migrate dev
```

### 5. Seed the database with dummy data

```
npx prisma db seed
```

### 6. Start the app!

```
npm run dev
```

The website should now be running at <http://localhost:3000>

## Contributing

Anyone is welcome to contribute!

TODO: add contribution guidelines
