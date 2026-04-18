const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Simple Message model for socket server
let Message;
function getMessageModel() {
  if (Message) return Message;
  const schema = new mongoose.Schema(
    {
      conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      message: { type: String, required: true },
    },
    { timestamps: true }
  );
  Message = mongoose.models.Message || mongoose.model("Message", schema);
  return Message;
}

// Simple Conversation model for updating timestamps
let Conversation;
function getConversationModel() {
  if (Conversation) return Conversation;
  const schema = new mongoose.Schema(
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      // Map of userId -> unread count
      unreadCounts: { type: Map, of: Number, default: {} },
    },
    { timestamps: true }
  );
  Conversation = mongoose.models.Conversation || mongoose.model("Conversation", schema);
  return Conversation;
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not set in .env");
    return;
  }
  await mongoose.connect(uri, { bufferCommands: false });
  console.log("Socket server connected to MongoDB");
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on('join_conversation', async (payload) => {
      const { conversationId, userId } = payload;
      socket.join(conversationId);
      // Reset unread count for this user
      if (conversationId && userId) {
        const Conv = getConversationModel();
        await Conv.updateOne({ _id: conversationId }, { $set: { [`unreadCounts.${userId}`]: 0 } });
      }
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on("send_message", async (data) => {
      try {
        await connectDB();
        const Msg = getMessageModel();
        const Conv = getConversationModel();

        // Save message to DB
        const newMsg = await Msg.create({
          conversationId: data.conversationId,
          senderId: data.senderId,
          message: data.message,
        });

        // Find the conversation to get both participants
        const conversation = await Conv.findById(data.conversationId).lean();

        // Determine the OTHER participant (the one who did NOT send this message)
        const otherUserId =
          conversation?.buyerId?.toString() === data.senderId
            ? conversation?.sellerId?.toString()
            : conversation?.buyerId?.toString();

        // Atomically increment unread count for the other participant + update timestamp
        if (otherUserId) {
          await Conv.updateOne(
            { _id: data.conversationId },
            {
              $inc: { [`unreadCounts.${otherUserId}`]: 1 },
              $set: { updatedAt: new Date() },
            }
          );
        }

        // Emit to everyone in the room (including sender)
        io.to(data.conversationId).emit("receive_message", {
          _id: newMsg._id.toString(),
          conversationId: data.conversationId,
          senderId: data.senderId,
          message: data.message,
          createdAt: newMsg.createdAt,
        });
      } catch (err) {
        console.error("Socket send_message error:", err);
        socket.emit("error_message", { error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    let networkIP = '';
    
    for (const name of Object.keys(networkInterfaces)) {
      for (const net of networkInterfaces[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          networkIP = net.address;
        }
      }
    }

    console.log();
    console.log(`  ▲ Next.js (Custom Socket Server)`);
    console.log(`  - Local:        http://localhost:${PORT}`);
    if (networkIP) {
      console.log(`  - Network:      http://${networkIP}:${PORT}`);
    }
    console.log(`  - Environments: loaded from .env`);
    console.log();
  });
});
