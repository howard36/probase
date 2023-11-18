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


## Setup Instructions

For local development:

1. Clone the repository and install dependencies
```
git clone https://github.com/howard36/probase.git
cd probase
yarn install  # or npm install
```

2. Set up a PostgreSQL database. You can find instructions on how to do this online.

3. Initialize the `.env.local` file:
```
cp .env.example .env.local
```

You'll want to manually edit some of the variables in `.env.local`:
- Replace both `DATABASE_URL` and `DIRECT_URL` with your Postgres connection string. 
- Replace `NEXTAUTH_SECRET` and `INTERNAL_API_KEY` with distinct [random passwords](https://www.random.org/passwords/?num=2&len=32&format=html&rnd=new).

4. Run database migrations:

```
yarn prisma migrate dev
```

5. Start the app!
```
yarn dev
```

You should be able to access the website at <http://localhost:3000>


## Contributing

Anyone is welcome to contribute!

TODO: add contribution guidelines
