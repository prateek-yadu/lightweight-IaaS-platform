import express from "express";
import vmsRoutes from "./routes/vms/vms.routes.js";
import authRoutes from "./routes/auth/auth.routes.js";
import profileRoutes from "./routes/profile/profile.routes.js";
import plans from "./routes/plans/plans.routes.js";
import healthRoute from "./routes/health/health.route.js";
import cookieParser from "cookie-parser";
import "dotenv/config";
import {
  authMiddleware,
  authMiddlewareForSocketIo,
} from "./middleware/auth.middleware.js";
import {
  limitModerate,
  limitStrict,
} from "./middleware/rate-limiter.middleware.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { Redis } from "ioredis";
import { cacheInstances, removeCahe } from "./cache/instance.cache.js";
import { redisConnection } from "../lib/redis.js";

const app = express();
const port = 3000; // <-- TODO: Put it in .env file

// integrating socker.io
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const redis = new Redis(redisConnection.connection);
const sub = new Redis(redisConnection.connection);

// subscribed to instance-events
sub.subscribe("instance-events", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  } else {
    console.log(
      `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
    );
  }
});

// triggers when something is publised on instance-events
sub.on("message", async (channel, message) => {
  // get the user id of instnace owner
  const parsedData = await JSON.parse(message);

  const userId = await redis.get(`instance-cache:${parsedData.instance}`);

  // check if room exists sends data to room
  if (io.sockets.adapter.rooms.get(`user:${userId}`) !== undefined) {
    io.to(`user:${userId}`).emit("instance:lifecycle:events", message);
  }
});

app.use(express.json()); // <-- express js body parser
app.use(cookieParser());

app.get("/", limitModerate, (req, res) => {
  res.send("VPS Provider Project");
});

app.use("/api/v1/vms", authMiddleware, limitStrict, vmsRoutes);

app.use("/api/v1/auth", limitStrict, authRoutes);

app.use("/api/v1/profile", authMiddleware, limitModerate, profileRoutes);

app.use("/api/v1/plans", limitModerate, plans);

// handles health route
app.use("/api/v1/health", healthRoute);

// handles non existing pages
app.use(limitStrict, (req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});

// socket.io middleware
io.use(authMiddlewareForSocketIo);

// handles socket connection
io.on("connection", async (socket) => {
  // cache user's instances
  await cacheInstances(socket.data.id);

  const userId = socket.data.id; // from auth middleware
  socket.join(`user:${userId}`);
  socket.emit("instance:lifecycle:events", "connected to room");

  // handles disconneted user
  socket.on("disconnect", ()=>{
    removeCahe(socket.data.id)
  })
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
