import React, { Suspense } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import Request from "@/models/Request";
import { auth } from "@/lib/auth";
import RequestsClient from "./RequestsClient";
import Header from "@/app/components/Header/Header";

import Notification from "@/models/Notification";

export default async function RequestsPage() {
  await connectToDatabase();
  const session = await auth();
  const currentUserId = session?.user?.id;

  const requests = await Request.find({ status: "open" })
    .sort({ createdAt: -1 })
    .populate("userId", "name")
    .lean();

  // Fetch unread notifications for the current user
  const unreadNotifications = currentUserId 
    ? await Notification.find({ userId: currentUserId, read: false }).countDocuments()
    : 0;

  return (
    <Suspense fallback={<div>Loading requests...</div>}>
      <Header />

      <RequestsClient 
        initialRequests={JSON.parse(JSON.stringify(requests))} 
        currentUserId={currentUserId}
        session={session}
        unreadNotifications={unreadNotifications}
      />
    </Suspense>
  );
}
