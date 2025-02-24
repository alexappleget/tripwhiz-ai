"use client";

import { VacationSuggestion } from "@/app/types/aiFunctionTypes";
import { getVacation } from "@/supabase/supabaseFunctions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { vacationDataDefault } from "./vacationDataDefault";
import {
  Calendar,
  Car,
  CircleDollarSign,
  Hotel,
  MapPin,
  Phone,
  Plane,
} from "lucide-react";

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
          <div className="flex flex-col gap-2 p-6 bg-[#dcf0fa] shadow-lg rounded-lg">
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
          <div className="flex flex-col gap-2 p-6 bg-[#dcf0fa] shadow-lg rounded-lg">
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
          <div className="flex flex-col items-center text-center gap-4 my-20">
            <h1 className="text-4xl font-bold text-[#50b8e7]">
              {vacationData.title}
            </h1>
            <p className="flex gap-2 justify-center text-lg">
              <Calendar /> {vacationData.bestTravelDates.start} -{" "}
              {vacationData.bestTravelDates.end}
            </p>
          </div>
          <div className="bg-[#dcf0fa] rounded-lg p-6 shadow-lg mx-6 md:mx-12">
            <h2 className="text-2xl font-semibold text-[#50b8e7] mb-4">
              Vacation Summary
            </h2>
            <p className="mb-4">{vacationData.vacationDescription}</p>
            <h2 className="text-2xl font-semibold text-[#50b8e7]">
              Total Vacation Cost: ${vacationData.totalPrice}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-6 md:mx-12 mt-8">
            <div className="flex flex-col gap-2 p-6 bg-[#dcf0fa] shadow-lg rounded-lg">
              <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-[#50b8e7]">
                {" "}
                <Hotel />
                Hotel Information
              </h2>
              <p className="font-bold text-xl">{vacationData.hotels.name}</p>
              <p className="flex gap-2">
                <MapPin className="text-[#50b8e7]" />{" "}
                {vacationData.hotels.location}
              </p>
              <p className="flex gap-2">
                <Phone className="text-[#50b8e7]" />
                {vacationData.hotels.phoneNumber}
              </p>
              <p className="flex gap-2">
                <CircleDollarSign className="text-[#50b8e7]" />$
                {vacationData.hotels.nightlyPrice}/night
              </p>
              <p className="font-semibold mt-4">
                Total Stay Cost: ${vacationData.hotels.totalStayCost}
              </p>
            </div>
            {renderTravelDetails()}
          </div>
          <div className="bg-[#dcf0fa] rounded-lg p-6 shadow-lg mx-6 md:mx-12 my-8">
            <h2 className="text-2xl font-semibold text-[#50b8e7] mb-4">
              Daily Itinerary
            </h2>
            {vacationData.itinerary.map((day) => (
              <div
                key={day.day}
                className="mb-6 last:mb-0 bg-[#edf7fc] p-4 rounded-lg"
              >
                <h3 className="text-xl font-semibold mb-2 text-[#50b8e7]">
                  Day {day.day}
                </h3>
                <p className="mb-2 text-sm md:text-base">{day.description}</p>
                <p className="text-sm text-[#50b8e7] mb-2">
                  Estimated Travel Cost: ${day.estimatedTravelCost}
                </p>
                <p className="text-sm text-[#50b8e7]">
                  Estimated Activity Cost: ${day.estimatedActivityCost}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
