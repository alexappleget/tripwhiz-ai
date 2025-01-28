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
    <section>
      {loadingData ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>{vacationData.title}</h1>
          <p>Total Trip Cost: {vacationData.totalPrice}</p>
          <p>Why choose this?</p>
          <p>{vacationData.vacationDescription}</p>
          <h2>Flight Details:</h2>
          <p>From: {vacationData.flights.from}</p>
          <p>To: {vacationData.flights.to}</p>
          <p>Price:</p>
          <p>Cost: ${vacationData.flights.roundTripCost}</p>
          <p>Taxes: ${vacationData.flights.taxes}</p>
          <p>Total: ${vacationData.flights.totalFlightCost}</p>
          <p>Best Time to Travel for the Month You Chose:</p>
          <p>{vacationData.bestTravelDates.start}</p>
          <p>{vacationData.bestTravelDates.end}</p>
          <p>{vacationData.bestTravelDates.reason}</p>
          <p>Hotel Details:</p>
          <p>Name: {vacationData.hotels.name}</p>
          <p>NightlyPrice: ${vacationData.hotels.nightlyPrice}/night</p>
          <p>Taxes: ${vacationData.hotels.taxes}/night</p>
          <p>Total Cost: ${vacationData.hotels.totalStayCost}</p>
          <p>Location: {vacationData.hotels.location}</p>
          <p>Phone Number: {vacationData.hotels.phoneNumber}</p>
          {vacationData.itinerary.map((day) => (
            <div key={day.day}>
              <p>Day {day.day}:</p>
              <p>{day.description}</p>
              <p>Budget to Spend: ${day.estimatedCost}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
