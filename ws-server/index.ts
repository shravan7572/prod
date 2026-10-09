import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = parseInt(process.env.PORT || process.env.WS_PORT || "8080", 10);
const rooms = new Map<string, Set<WebSocket>>();

const server = http.createServer((req, res) => {
  // Health check endpoint
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", port: PORT, rooms: Array.from(rooms.keys()).length }));
    return;
  }

  // Internal broadcast endpoint invoked by Next.js API routes
  if (req.method === "POST" && req.url === "/broadcast") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const { post, followerIds } = JSON.parse(body);

        const message = JSON.stringify({
          type: "new_post",
          payload: post,
        });

        // 1. Broadcast to discover room
        const discoverClients = rooms.get("discover");
        if (discoverClients) {
          for (const socket of discoverClients) {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(message);
            }
          }
        }

        // 2. Broadcast to author's own room
        if (post?.userId) {
          const authorClients = rooms.get(`user:${post.userId}`);
          if (authorClients) {
            for (const socket of authorClients) {
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(message);
              }
            }
          }
        }

        // 3. Broadcast to each follower's room
        if (Array.isArray(followerIds)) {
          for (const followerId of followerIds) {
            const followerClients = rooms.get(`user:${followerId}`);
            if (followerClients) {
              for (const socket of followerClients) {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(message);
                }
              }
            }
          }
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err: unknown) {
        console.error("Error handling broadcast:", err);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid broadcast payload" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket: WebSocket) => {
  const subscribedRooms = new Set<string>();

  socket.on("message", (rawMsg: string) => {
    try {
      const msg = JSON.parse(rawMsg.toString());
      if (msg.type === "join") {
        const room = msg.payload?.room;
        if (room && typeof room === "string") {
          if (!rooms.has(room)) {
            rooms.set(room, new Set());
          }
          rooms.get(room)!.add(socket);
          subscribedRooms.add(room);
          socket.send(
            JSON.stringify({
              type: "joined",
              payload: { room },
            })
          );
        }
      } else if (msg.type === "leave") {
        const room = msg.payload?.room;
        if (room && rooms.has(room)) {
          rooms.get(room)!.delete(socket);
          subscribedRooms.delete(room);
        }
      }
    } catch (err) {
      console.error("Invalid WS message:", err);
    }
  });

  socket.on("close", () => {
    for (const room of subscribedRooms) {
      if (rooms.has(room)) {
        rooms.get(room)!.delete(socket);
        if (rooms.get(room)!.size === 0) {
          rooms.delete(room);
        }
      }
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

server.listen(PORT, () => {
  console.log(`ShipIt WebSocket server running on http/ws://localhost:${PORT}`);
});
