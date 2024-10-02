This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

#### Start server

`npm run server`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

You will require a`config.env` at root level:
ATLAS_URI=mongodb+srv://username:password@cluster0.pczcs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5050
JWT_SECRET=\***\*\*\*\*\*\***

to generate the JWT_SECRET use: `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## About Loons Team Balancer

Loons Team Balancer is a Next.js-based solution designed to create fair and well-balanced soccer teams each week. The app takes into account player skills, gender, and other attributes to ensure a fun and competitive experience for everyone. It is ideal for recurring games with a mix of players of different abilities and positions, making it easy to shuffle teams fairly every time.

At the core of the app is an advanced team balancing algorithm. It evaluates the players available each week based on their attack, defense, and fitness scores. Players are sorted primarily by gender and then by overall score. Using a modified serpentine draft method, the algorithm distributes players across teams while keeping the overall skill levels balanced. It even introduces slight randomness to ensure that teams vary week to week.

The app also tracks the ratio of players by gender to ensure inclusivity. Whether the group has an even or odd number of players, or an unbalanced mix of skillsets, the Loons Team Balancer aims for fairness in team distribution, fostering an enjoyable game for all participants.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
