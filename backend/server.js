require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);

const dashboardRoutes = require("./routes/dashboardRoutes");

// Connect DB
connectDB();

// ✅ Allowed origins (add your production + local)
const allowedOrigins = [
  process.env.FRONTEND_URL, // your Vercel deployed URL
];

// ✅ CORS middleware (robust version)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests without origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      // allow Vercel preview URLs dynamically
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

// ✅ Socket.IO setup with same CORS logic
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Socket CORS blocked: ${origin}`));
    },
    methods: ["GET", "POST"],
    credentials: true,
    credentials: true,
  },
});

// Socket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send_message", (data) => {
    io.to(data.chatId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Debug logs (optional but useful)
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
});
