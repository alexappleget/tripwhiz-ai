"use client";

import { VacationSuggestion } from "@/app/types/aiFunctionTypes";
import { getVacation } from "@/supabase/supabaseFunctions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { vacationDataDefault } from "./vacationDataDefault";

export default function Vacations() {
  const { id }: { id: string } = useParams();
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [vacationData, setVacationData] =
    useState<VacationSuggestion>(vacationDataDefault);

  useEffect(() => {
    const grabVacation = async () => {
      setLoadingData(true);
      try {
        const data = await getVacation({ id });
        console.log(data);
        setVacationData(data);
      } catch (error) {
        throw error;
      } finally {
        setLoadingData(false);
      }
    };
    grabVacation();
  }, [id]);

  return (
    <section className="border-2 border-black w-full min-h-screen">
      {loadingData ? (
        <p>Loading...</p>
      ) : (
        <>
          <h1 className="text-center my-20 text-4xl font-extrabold">
            {vacationData.title}
          </h1>
        </>
      )}
    </section>
  );
}
