# Probase

Probase is a new project meant to help students run their own math contests. The goal is simple: **better math contests for everyone**. I'm currently putting a team to make this a reality. If you're interested, you're welcome to join!

### The inspiration

Every math contest - from community-driven AoPS mocks, to college-run competitions like HMMT, and even the IMO - rely on a dedicated team of volunteers committed to making it happen.

But pulling off a successful contest is hard. It takes lots of effort, and there are many ways to mess up. Consider testsolving: it's a crucial step where fresh eyes are needed, and most contests don't have enough volunteers to thoroughly testsolve everything. This leads to issues like AIME I #12, where the correct answer 385 was missed, and the true difficulty was misjudged. 😢

It's especially tough for newcomers trying to start their own contest. That's where Probase comes in!

### The plan

Probase will be a set of tools and resources for organizers to run top-notch math contests:

- A collaborative space for problem writers and testsolvers to brainstorm, create, and refine their problem proposals. You've already seen a sneak peek with the OTIS Mock AIME.
- An online contest platform where anyone can host and participate in contests, like Codeforces, but for math. The eventual goal is to run contests every week, providing a steady stream of high-quality problems.
- Guides and tutorials for contest creators. There are plenty of resources on solving problems, but far fewer on how to create them.
- A community hub where problem-writers can collaborate, find testsolvers, and share ideas with each other.

If you want to help improve the math contest scene, you should join the Probase team! Just send me an email at howardhalim@gmail.com to get involved.

`// end recruiting pitch`

## Development Setup

### 1. Clone the repository and install dependencies

```
git clone https://github.com/howard36/probase.git
cd probase
npm install
```

### 2. Set up Postgres

Using Docker is probably easiest. Follow the steps in [this guide](https://www.docker.com/blog/how-to-use-the-postgres-docker-official-image/) to set it up.

1. Download the latest [Docker Desktop release](https://www.docker.com/products/docker-desktop/)
2. Pulling the official Postgres Docker image: `docker pull postgres`
3. Start a new Docker container running Postgres: `docker run -d --name probase-db -e POSTGRES_PASSWORD=<db-password> -p 5432:5432 postgres`. Make sure to replace `<db-password>` with a [random password](https://www.random.org/passwords/?num=1&len=22&format=html&rnd=new).

### 3. Initialize the `.env.local` file

```
cp .env.example .env.local
```

You'll want to manually edit some of the variables in `.env.local`:

- Replace both `DATABASE_URL` and `DIRECT_URL` with your Postgres connection string. It should use the same `<db-password>` as step 2.3.
- Set `NEXTAUTH_SECRET` to another [random password](https://www.random.org/passwords/?num=1&len=22&format=html&rnd=new).

### 4. Initialize the database

1. Run migrations: `npx migrate-dev`
2. Seed the database with dummy data `npx db-seed`. (Note: this might not work at the moment. You can skip to step 5, there just won't be any data)

### 5. Start the app!

```
npm run dev
```

The website should now be running at <http://localhost:3000>

## Contributing

Anyone is welcome to contribute!

TODO: add contribution guidelines
