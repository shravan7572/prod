const { Client } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_S6N2jVrDUmQY@ep-raspy-mouse-ael30r3g-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log("Connected to NeonDB. Seeding initial users and posts...");

  const users = [
    {
      id: "usr_shravan01",
      name: "Shravan Choudhary",
      username: "shravan",
      email: "shravan@shipit.dev",
      bio: "Building ShipIt & developer tools. Daily accountability shipper.",
      githubUrl: "https://github.com/shravan7572",
      college: "COEP Tech University",
      city: "Pune",
      currentStreak: 7,
      longestStreak: 12,
      lastShippedAt: new Date().toISOString(),
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=shravan",
    },
    {
      id: "usr_aarav02",
      name: "Aarav Sharma",
      username: "aarav_builds",
      email: "aarav@shipit.dev",
      bio: "Indie hacker. Shipping micro-SaaS with Next.js, Postgres & Tailwind.",
      githubUrl: "https://github.com/aarav-builds",
      college: "IIT Bombay",
      city: "Mumbai",
      currentStreak: 14,
      longestStreak: 21,
      lastShippedAt: new Date().toISOString(),
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=aarav_builds",
    },
    {
      id: "usr_priya03",
      name: "Priya Patel",
      username: "priyacodes",
      email: "priya@shipit.dev",
      bio: "Full-stack developer & open source enthusiast. Shipping daily without fail.",
      githubUrl: "https://github.com/priyacodes",
      college: "IIIT Bangalore",
      city: "Bangalore",
      currentStreak: 5,
      longestStreak: 9,
      lastShippedAt: new Date().toISOString(),
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=priyacodes",
    },
    {
      id: "usr_rohan04",
      name: "Rohan Verma",
      username: "rohanv",
      email: "rohan@shipit.dev",
      bio: "Frontend engineer obsessed with minimal monochrome UI and web perf.",
      githubUrl: "https://github.com/rohanv",
      college: "BITS Pilani",
      city: "Pune",
      currentStreak: 11,
      longestStreak: 15,
      lastShippedAt: new Date().toISOString(),
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=rohanv",
    },
  ];

  for (const u of users) {
    await client.query(
      `INSERT INTO "User" (id, name, email, image, username, bio, "githubUrl", college, city, "currentStreak", "longestStreak", "lastShippedAt", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         username = EXCLUDED.username,
         bio = EXCLUDED.bio,
         "githubUrl" = EXCLUDED."githubUrl",
         college = EXCLUDED.college,
         city = EXCLUDED.city,
         "currentStreak" = EXCLUDED."currentStreak",
         "longestStreak" = EXCLUDED."longestStreak",
         "lastShippedAt" = EXCLUDED."lastShippedAt";`,
      [
        u.id,
        u.name,
        u.email,
        u.image,
        u.username,
        u.bio,
        u.githubUrl,
        u.college,
        u.city,
        u.currentStreak,
        u.longestStreak,
        u.lastShippedAt,
      ]
    );
    console.log(`Upserted user: @${u.username}`);
  }

  const posts = [
    {
      id: "pst_001",
      userId: "usr_shravan01",
      content: "Shipped the real-time WebSocket feed for ShipIt today! Instant broadcast to discover & follower channels.",
      links: "https://github.com/shravan7572/shipit",
      tags: ["nextjs", "websocket", "prisma"],
    },
    {
      id: "pst_002",
      userId: "usr_aarav02",
      content: "Optimized NeonDB PostgreSQL indexing for high concurrent ship feeds. Query response dropped from 120ms to 8ms.",
      links: "https://neon.tech",
      tags: ["postgres", "neondb", "backend"],
    },
    {
      id: "pst_003",
      userId: "usr_priya03",
      content: "Built the streak validation engine with IST midnight reset boundaries. Handles edge-case clock drifts seamlessly.",
      links: "https://github.com/priyacodes",
      tags: ["typescript", "logic", "architecture"],
    },
    {
      id: "pst_004",
      userId: "usr_rohan04",
      content: "Designed the ultra-clean monochrome UI for ShipIt. Pure black, white, and zinc with sharp typography. No purple gradient anywhere.",
      links: "https://tailwindcss.com",
      tags: ["tailwindcss", "design", "minimalism"],
    },
  ];

  for (const p of posts) {
    await client.query(
      `INSERT INTO "Post" (id, content, links, tags, "userId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW() - interval '2 hour')
       ON CONFLICT (id) DO NOTHING;`,
      [p.id, p.content, p.links, p.tags, p.userId]
    );
    console.log(`Inserted post: ${p.id}`);
  }

  // Setup follows
  await client.query(
    `INSERT INTO "Follow" (id, "followerId", "followingId", "createdAt")
     VALUES ('flw_001', 'usr_shravan01', 'usr_aarav02', NOW()),
            ('flw_002', 'usr_shravan01', 'usr_priya03', NOW()),
            ('flw_003', 'usr_aarav02', 'usr_shravan01', NOW())
     ON CONFLICT ("followerId", "followingId") DO NOTHING;`
  );
  console.log("Follow relationships setup.");

  // Add sample pledge
  await client.query(
    `INSERT INTO "Pledge" (id, content, date, "userId", "createdAt")
     VALUES ('plg_001', 'Ship mobile responsive polish and keyboard shortcuts for feed navigation', NOW() + interval '1 day', 'usr_shravan01', NOW())
     ON CONFLICT (id) DO NOTHING;`
  );
  console.log("Sample pledge added.");

  await client.end();
  console.log("Database seeded successfully!");
}

seed().catch(console.error);
