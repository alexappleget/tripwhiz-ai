"use client";

import { Button } from "@/components/Button/button";
import Link from "next/link";

export default function Dashboard() {
  return (
    <section className="w-full min-h-screen">
      <div className="flex items-center justify-between px-4 md:px-16 lg:px-32 xl:px-52 h-40">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button className="text-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3">
          <Link href="/create-vacation">Create Vacation</Link>
        </Button>
      </div>
      <div className="flex flex-col flex-grow px-4 md:px-16 lg:px-32 xl:px-52">
        <h2 className="font-semibold text-lg mb-2">My Groups</h2>
        <div className="grid xl:grid-cols-3"></div>
      </div>
    </section>
  );
}
