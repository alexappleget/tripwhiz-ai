"use client";

import { Button } from "@/components/Button/button";
import { getAllUserVacations } from "@/supabase/supabaseFunctions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserVacation } from "../types/aiFunctionTypes";

export default function Dashboard() {
  const [vacations, setVacations] = useState<UserVacation[]>([]);

  useEffect(() => {
    const fetchAllUserVacations = async () => {
      const response = await getAllUserVacations();
      if (!response) {
        throw new Error("Vacations not found!");
      }
      setVacations(response);
    };
    fetchAllUserVacations();
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {vacations.map((vacation) => (
            <div key={vacation.id} className="border-2 rounded-lg p-6">
              <h2>{vacation.suggestion.title}</h2>
              <p>
                {vacation.suggestion.bestTravelDates.start} -{" "}
                {vacation.suggestion.bestTravelDates.end}
              </p>
              <p>Total Price: ${vacation.suggestion.totalPrice}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
