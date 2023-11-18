# Probase: A Math Contest Problem Database

[Probase](https://www.probase.app/c/demo) is an online collaborative database for problem writers to save and share the problems they create, and for contest organizers to manage large numbers of problem proposals.


## Features

- [x] Latex rendering of math expressions
- [x] Uploading any math problems you create
- [x] Answer and solutions, hidden by default
- [x] Discussion thread for each problem
- [x] Permission roles to control access
- [x] Draft tests from a chosen set of proposals
- [x] Invite links to share with others
- [ ] Timed testsolving
- [ ] Upvotes for high-quality problems


## Roadmap / Vision

TODO


## Development Setup

### 1. Clone the repository and install dependencies

```
git clone https://github.com/howard36/probase.git
cd probase
yarn install  # or npm install
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
- Replace `NEXTAUTH_SECRET` and `INTERNAL_API_KEY` with unique [random passwords](https://www.random.org/passwords/?num=2&len=32&format=html&rnd=new).

### 4. Run database migrations

```
yarn prisma migrate dev
```

### 5. Seed the database with dummy data
```
yarn prisma db seed
```

### 6. Start the app!
```
yarn dev
```

The website should now be running at <http://localhost:3000>


## Contributing

Anyone is welcome to contribute!

TODO: add contribution guidelines
