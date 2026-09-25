// Local verification fixtures. Resets everything except the seeded demo data,
// then creates users in every role, a testsolving collection, a test and invites.
// Run from the repository root: npx dotenv -e {env file} -- node product-description/verification/scripts/fixtures.cjs
// It TRUNCATES EVERY TABLE of the database in DATABASE_URL. Never point it at a real database.
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const USERS = {
  admin: { name: "Ada Admin", email: "ada@example.com" },
  writer: { name: "Wes Writer", email: "wes@example.com" },
  member: { name: "Tia Member", email: "tia@example.com" },
  serious: { name: "Sam Serious", email: "sam@example.com" },
  serious2: { name: "Sue Serious", email: "sue@example.com" },
  casual: { name: "Cal Casual", email: "cal@example.com" },
  unchosen: { name: "Uma Unchosen", email: "uma@example.com" },
  viewer: { name: "Vic Viewer", email: "vic@example.com" },
  submitter: { name: "Sid Submitter", email: "sid@example.edu" },
  stranger: { name: "Stan Stranger", email: "stan@example.com" },
  student: { name: "Eve Student", email: "eve@example.edu" },
};

async function main() {
  // Clean slate (keep nothing but schema), then recreate demo-like data ourselves.
  const tables = await prisma.$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations'`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`,
  );

  const u = {};
  for (const [key, data] of Object.entries(USERS)) {
    u[key] = await prisma.user.create({ data: { id: `u-${key}`, ...data } });
  }

  // demo: like the seed (authors hidden, ShortAnswer, no testsolving)
  const demo = await prisma.collection.create({
    data: {
      name: "Probase Demo",
      cid: "demo",
      showAuthors: false,
      createdAt: new Date(Date.now() - 86400000),
    },
  });
  // ts: requires testsolving, Integer answers, authors shown
  const ts = await prisma.collection.create({
    data: {
      name: "Testsolve Lab",
      cid: "ts",
      showAuthors: true,
      requireTestsolve: true,
      answerFormat: "Integer",
      createdAt: new Date(Date.now() - 86400000),
    },
  });
  // aime: requires testsolving, AIME answers, difficulty optional
  const aime = await prisma.collection.create({
    data: {
      name: "AIME Lab",
      cid: "aime",
      showAuthors: true,
      requireTestsolve: true,
      answerFormat: "AIME",
      requireDifficulty: false,
      requireSolution: false,
      createdAt: new Date(Date.now() - 86400000),
    },
  });
  // Code-configured slugs
  const topsoj = await prisma.collection.create({
    data: {
      name: "TopsOJ",
      cid: "topsoj",
      showAuthors: true,
      requireTestsolve: true,
      answerFormat: "Integer",
      createdAt: new Date(Date.now() - 86400000),
    },
  });
  const otis = await prisma.collection.create({
    data: {
      name: "OTIS Mock AIME",
      cid: "otis-mock-aime",
      showAuthors: true,
      answerFormat: "AIME",
      createdAt: new Date(Date.now() - 86400000),
    },
  });

  const perm = (user, coll, accessLevel, extra = {}) =>
    prisma.permission.create({
      data: { userId: user.id, collectionId: coll.id, accessLevel, ...extra },
    });
  const serious = (coll) => ({
    testsolverType: "Serious",
    seriousTestsolverStartedAt: coll.createdAt,
  });
  const casual = (coll) => ({
    testsolverType: "Casual",
    seriousTestsolverStartedAt: coll.createdAt,
  });

  await perm(u.admin, demo, "Admin");
  await perm(u.writer, demo, "TeamMember");
  await perm(u.member, demo, "TeamMember");
  await perm(u.viewer, demo, "ViewOnly");
  await perm(u.submitter, demo, "SubmitOnly");
  await perm(u.admin, ts, "Admin", serious(ts));
  await perm(u.writer, ts, "TeamMember", serious(ts));
  await perm(u.serious, ts, "TeamMember", serious(ts));
  await perm(u.serious2, ts, "ViewOnly", serious(ts));
  await perm(u.casual, ts, "ViewOnly", casual(ts));
  await perm(u.unchosen, ts, "TeamMember");
  await perm(u.admin, aime, "Admin", serious(aime));
  await perm(u.serious, aime, "TeamMember", serious(aime));
  await perm(u.admin, otis, "Admin");

  const author = (user, coll, displayName) =>
    prisma.author.create({
      data: {
        displayName,
        userId: user ? user.id : null,
        collectionId: coll.id,
      },
    });
  const defaultAuthor = await author(null, demo, "Default Author");
  const wesDemo = await author(u.writer, demo, "Wes Writer");
  const wesTs = await author(u.writer, ts, "Wes Writer");
  const adaAime = await author(u.admin, aime, "Ada Admin");

  let t = Date.now() - 3600000;
  const problem = (coll, pid, fields, authorIds, solution) =>
    prisma.problem.create({
      data: {
        collectionId: coll.id,
        pid,
        isAnonymous: false,
        createdAt: new Date((t += 1000)),
        subject: {
          A: "Algebra",
          C: "Combinatorics",
          G: "Geometry",
          N: "NumberTheory",
        }[pid[0]],
        ...fields,
        authors: { connect: authorIds.map((id) => ({ id })) },
        ...(solution && {
          solutions: {
            create: [
              {
                text: solution,
                authors: { connect: authorIds.map((id) => ({ id })) },
              },
            ],
          },
        }),
      },
    });

  // demo problems
  await problem(
    demo,
    "A1",
    {
      title: "Quadratic Equation",
      statement: "Find all roots of the quadratic $$x^2 - 4x + 2.$$",
      answer: String.raw`$2 \pm \sqrt{2}$`,
      difficulty: 2,
    },
    [defaultAuthor.id],
    String.raw`Use the quadratic formula: $$x = 2 \pm \sqrt{2}$$`,
  );
  await problem(
    demo,
    "N1",
    {
      title: "Fermat's Last Theorem",
      statement:
        "Find all positive integer solutions to $$a^n + b^n = c^n$$ with $n \\ge 3$.",
      answer: "None",
      difficulty: 5,
    },
    [defaultAuthor.id],
    "Left as an exercise.",
  );
  await problem(
    demo,
    "C1",
    {
      title: "Wes's counting problem",
      statement: "How many subsets does $\\{1,2,3\\}$ have?",
      answer: "8",
      difficulty: 1,
    },
    [wesDemo.id],
    null,
  );
  await problem(
    demo,
    "G1",
    {
      title: "Empty answer",
      statement: "A problem whose answer is still to come.",
      answer: "",
      difficulty: 3,
    },
    [wesDemo.id],
    null,
  );
  await problem(
    demo,
    "A2",
    {
      title: "Archived algebra",
      statement: "This one is archived.",
      answer: "1",
      difficulty: 1,
      isArchived: true,
    },
    [wesDemo.id],
    null,
  );
  await problem(
    demo,
    "A3",
    {
      title: "Math $x^2$ in the title",
      statement:
        "Unclosed $ dollar and \\(a+b\\) inline, \\[c\\] display, $\\frac{1}{$ broken.",
      answer: "3",
      difficulty: 1,
    },
    [defaultAuthor.id],
    null,
  );
  for (let i = 4; i <= 24; i++) {
    await problem(
      demo,
      `A${i}`,
      {
        title: `Filler problem ${i}`,
        statement: `Filler statement number ${i}.`,
        answer: `${i}`,
        difficulty: (i % 5) + 1,
      },
      [defaultAuthor.id],
      null,
    );
  }

  // ts problems, created after the collection, all by Wes
  const p1 = await problem(
    ts,
    "A1",
    {
      title: "Sum of two",
      statement: "What is $1 + 1$?",
      answer: "2",
      difficulty: 1,
    },
    [wesTs.id],
    "It is $2$.",
  );
  const p2 = await problem(
    ts,
    "N1",
    {
      title: "Small prime",
      statement: "What is the smallest prime?",
      answer: "2",
      difficulty: 2,
    },
    [wesTs.id],
    "Two.",
  );
  const p3 = await problem(
    ts,
    "C1",
    {
      title: "Short answer with math",
      statement: "Write $\\sqrt{2}$.",
      answer: "$\\sqrt{2}$",
      difficulty: 1,
    },
    [wesTs.id],
    null,
  );
  const p4 = await problem(
    ts,
    "G1",
    {
      title: "No difficulty",
      statement: "This problem has no difficulty.",
      answer: "7",
      difficulty: null,
    },
    [wesTs.id],
    null,
  );
  const p5 = await problem(
    ts,
    "A2",
    {
      title: "Already solved by Sue",
      statement: "What is $2 \\times 3$?",
      answer: "6",
      difficulty: 1,
    },
    [wesTs.id],
    "Six.",
  );
  const p6 = await problem(
    ts,
    "N2",
    {
      title: "Leaderboard crowd",
      statement: "What is $10 - 3$?",
      answer: "7",
      difficulty: 1,
    },
    [wesTs.id],
    "Seven.",
  );
  await prisma.solveAttempt.create({
    data: {
      userId: u.serious2.id,
      problemId: p5.id,
      startedAt: new Date(Date.now() - 1800000),
      solvedAt: new Date(Date.now() - 1700000),
      numSubmissions: 2,
    },
  });
  // A crowd on N2 so the top-five rule shows
  for (let i = 1; i <= 7; i++) {
    const cu = await prisma.user.create({
      data: {
        id: `u-crowd${i}`,
        name: `Crowd ${i}`,
        email: `crowd${i}@example.com`,
      },
    });
    await perm(cu, ts, "ViewOnly", serious(ts));
    await prisma.solveAttempt.create({
      data: {
        userId: cu.id,
        problemId: p6.id,
        startedAt: new Date(Date.now() - 3000000),
        solvedAt: i <= 6 ? new Date(Date.now() - 3000000 + i * 60000) : null,
        numSubmissions: i <= 6 ? 1 + (i % 2) : 3,
      },
    });
  }
  const test = await prisma.test.create({
    data: { name: "Mock Contest #1", collectionId: ts.id },
  });
  await prisma.testProblem.create({
    data: { testId: test.id, problemId: p1.id, position: 1 },
  });
  await prisma.testProblem.create({
    data: { testId: test.id, problemId: p2.id, position: 2 },
  });
  await prisma.testProblem.create({
    data: { testId: test.id, problemId: p5.id, position: 3 },
  });

  // aime problems
  await problem(
    aime,
    "A1",
    {
      title: "AIME style",
      statement: "Compute $6 \\cdot 7$.",
      answer: "42",
      difficulty: 1,
    },
    [adaAime.id],
    null,
  );

  // Invites
  const invite = (code, coll, accessLevel, extra = {}) =>
    prisma.invite.create({
      data: {
        code,
        collectionId: coll.id,
        accessLevel,
        inviterId: u.admin.id,
        ...extra,
      },
    });
  await invite("demo", demo, "Admin");
  await invite("join-demo", demo, "TeamMember");
  await invite("view-demo", demo, "ViewOnly");
  await invite("submit-demo", demo, "SubmitOnly");
  await invite("once-demo", demo, "TeamMember", { oneTimeUse: true });
  await invite("once-expiring", demo, "TeamMember", {
    oneTimeUse: true,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  await invite("expired-demo", demo, "TeamMember", {
    expiresAt: new Date(Date.now() - 86400000),
  });
  await invite("edu-demo", demo, "TeamMember", { emailDomain: "example.edu" });
  await invite("join-ts", ts, "TeamMember");
  await invite("join-topsoj", topsoj, "TeamMember");
  console.log("fixtures ready");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
