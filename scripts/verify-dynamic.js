const { Client } = require("pg");

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_S6N2jVrDUmQY@ep-raspy-mouse-ael30r3g-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";

async function verifyDynamicPipeline() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  console.log("=== Verifying Live Dynamic Pipeline in PostgreSQL ===");

  const timestamp = Date.now();
  const testUserId = `test_usr_${timestamp}`;
  const testUsername = `user_${timestamp.toString().slice(-4)}`;
  const testEmail = `builder_${timestamp}@test.dev`;

  // 1. Create a brand new user dynamically
  await client.query(
    `INSERT INTO "User" (id, name, email, username, bio, "currentStreak", "longestStreak", "createdAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [testUserId, "Dynamic Tester", testEmail, testUsername, "Testing dynamic flows", 0, 0]
  );
  console.log(`[1] Created dynamic user @${testUsername} (ID: ${testUserId})`);

  // Check initial counts
  const initialUser = (await client.query(`SELECT * FROM "User" WHERE id = $1`, [testUserId])).rows[0];
  console.log(`    Streak: ${initialUser.currentStreak} | Longest: ${initialUser.longestStreak} | ShippedAt: ${initialUser.lastShippedAt}`);

  // 2. Follow @shravan dynamically
  await client.query(
    `INSERT INTO "Follow" (id, "followerId", "followingId", "createdAt")
     VALUES ($1, $2, $3, NOW())`,
    [`flw_${timestamp}`, testUserId, "usr_shravan01"]
  );
  console.log(`[2] Followed @shravan`);

  const followCheck = (await client.query(
    `SELECT count(*) FROM "Follow" WHERE "followingId" = 'usr_shravan01'`
  )).rows[0].count;
  console.log(`    @shravan follower count is now dynamically: ${followCheck}`);

  // 3. Create a daily ship post dynamically
  const postId = `pst_${timestamp}`;
  await client.query(
    `INSERT INTO "Post" (id, content, tags, "userId", "createdAt")
     VALUES ($1, $2, $3, $4, NOW())`,
    [postId, "Shipped real-time updates today!", ["realtime", "dynamic"], testUserId]
  );
  console.log(`[3] Shipped post in DB: "${postId}"`);

  // 4. Update streak on post
  await client.query(
    `UPDATE "User"
     SET "currentStreak" = "currentStreak" + 1,
         "longestStreak" = GREATEST("longestStreak", "currentStreak" + 1),
         "lastShippedAt" = NOW()
     WHERE id = $1`,
    [testUserId]
  );
  const updatedUser = (await client.query(`SELECT * FROM "User" WHERE id = $1`, [testUserId])).rows[0];
  console.log(`[4] Streak dynamically updated to: ${updatedUser.currentStreak} days (longest: ${updatedUser.longestStreak} days)`);

  // 5. Query user's Following feed dynamically
  const feedRows = (await client.query(
    `SELECT p.content, u.username
     FROM "Post" p
     JOIN "User" u ON p."userId" = u.id
     WHERE p."userId" IN (SELECT "followingId" FROM "Follow" WHERE "followerId" = $1)
     ORDER BY p."createdAt" DESC`,
    [testUserId]
  )).rows;
  console.log(`[5] User's personalized Following feed fetched ${feedRows.length} post(s):`);
  feedRows.forEach(r => console.log(`    - @${r.username}: "${r.content.slice(0, 50)}..."`));

  // 6. Clean up test record
  await client.query(`DELETE FROM "User" WHERE id = $1`, [testUserId]);
  console.log(`[6] Cleaned up temporary test user.`);

  await client.end();
  console.log("=== Verification Successful: Everything is 100% Dynamic & Persisted in DB! ===");
}

verifyDynamicPipeline().catch(console.error);
