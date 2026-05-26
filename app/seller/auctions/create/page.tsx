import React from "react";
import CreateAuctionForm from "./CreateAuctionForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CreateAuctionPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  return <CreateAuctionForm />;
}
