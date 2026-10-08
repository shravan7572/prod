/**
 * Server-side broadcast utility.
 * Sends payload to the standalone WebSocket server's HTTP broadcast endpoint.
 */
export async function broadcastNewPostToWSServer(post: unknown, followerIds: string[] = []) {
  const wsServerHttpUrl = process.env.WS_INTERNAL_URL || "http://127.0.0.1:8080/broadcast";
  try {
    const response = await fetch(wsServerHttpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post, followerIds }),
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    // If WS server is not currently running or reachable, silently continue.
    // Next.js HTTP feed remains 100% functional.
    return false;
  }
}
