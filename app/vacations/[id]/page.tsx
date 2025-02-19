"use client";

import { VacationSuggestion } from "@/app/types/aiFunctionTypes";
import { getVacation } from "@/supabase/supabaseFunctions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { vacationDataDefault } from "./vacationDataDefault";
import { Calendar, Car, Plane } from "lucide-react";

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

  const renderTravelDetails = () => {
    switch (true) {
      case Boolean(vacationData.flights):
        return (
          <div className="w-full flex flex-col gap-2 p-6 mx-6 mt-4 bg-[#dcf0fa] shadow-lg rounded-lg hover:bg-[#b9e2f5]">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-[#50b8e7]">
              {" "}
              <Plane />
              Flying Details
            </h2>
            <p>From: {vacationData.flights?.from}</p>
            <p>To: {vacationData.flights?.to}</p>
            <p>
              Estimated Round Trip Cost: ${vacationData.flights?.roundTripCost}
            </p>
            <p>Estimated Taxes: ${vacationData.flights?.taxes}</p>
            <p className="font-semibold mt-4">
              Estimated Total Cost: ${vacationData.flights?.totalFlightCost}
            </p>
          </div>
        );
      case Boolean(vacationData.driving):
        return (
          <div className="w-1/2 flex flex-col gap-2">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-[#50b8e7]">
              {" "}
              <Car />
              Driving Details
            </h2>
            <p>Starting Location: {vacationData.driving?.startingLocation}</p>
            <p>Distance: {vacationData.driving?.distance} miles</p>
            <p className="font-semibold mt-4">
              Estimated Fuel Cost: ${vacationData.driving?.fuelCost}
            </p>
          </div>
        );
    }
  };

  return (
    <section className="w-full min-h-screen">
      {loadingData ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4">
            <h1 className="mt-10 text-4xl font-bold text-[#50b8e7]">
              {vacationData.title}
            </h1>
            <p className="flex gap-2 justify-center text-lg">
              <Calendar /> {vacationData.bestTravelDates.start} -{" "}
              {vacationData.bestTravelDates.end}
            </p>
          </div>
          <div className="w-full flex gap-2">{renderTravelDetails()}</div>
        </>
      )}
    </section>
  );
}
