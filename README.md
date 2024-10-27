# Probase

Probase is a new project meant to help students run their own math contests. The goal is to improve the math contest scene by creating better math contests for everyone.

### Inspiration

Every math contest - from community-driven AoPS mocks, to college-run competitions like CMIMC, and even the IMO - rely on a dedicated team of volunteers committed to making it happen.

But pulling off a successful contest is hard. It takes lots of effort, and there are many ways to mess up. Consider testsolving: it's a crucial step where fresh eyes are needed, and most contests don't have enough volunteers to thoroughly testsolve everything. This leads to issues like AIME I #12, where the correct answer 385 was missed, and the true difficulty was misjudged.

It's especially tough for newcomers trying to start their own contest. That's where Probase comes in!

### Current Plan

Probase will be a set of tools and resources for organizers to run top-notch math contests:

- A collaborative space for problem writers and testsolvers to brainstorm, create, and refine their problem proposals. You can see a sneak peek at <https://probase.app/c/demo>.
- An online contest platform where anyone can host their own contest and participate in others. The goal is to eventually have a steady stream of high-quality problems, like Codeforces but for math.
- Guides and tutorials for contest creators. There are plenty of resources on solving problems, but far fewer on how to come up with them.
- A community hub where problem-writers can collaborate, find testsolvers, and share ideas with each other.

Probase is still in the early stages of development. If you want to help out, you're welcome to join the team! We're using a Discord server to collaborate, just [ask me](mailto:howardhalim@gmail.com) for an invite.

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

- Set `DATABASE_URL` to your Postgres connection string. It should use the same `<db-password>` as step 2.3.
- Set `NEXTAUTH_SECRET` to another [random password](https://www.random.org/passwords/?num=1&len=22&format=html&rnd=new).

### 4. Initialize the database

1. Run migrations: `npm run local -- prisma migrate dev`
2. Seed the database with dummy data: `npm run local -- prisma db seed`

### 5. Start the app!

```
npm run dev
```

The website should now be running at <http://localhost:3000>

## Contributing

Anyone is welcome to contribute!

TODO: add contribution guidelines
