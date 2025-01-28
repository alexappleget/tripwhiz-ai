"use server";

import { openai } from "@/config/openAIConfig";
import { createClient } from "./server";
import { Profile } from "@/app/types/Profile";
import { TravelPreferences } from "@/app/types/TravelPreferences";
import { ItineraryDay, VacationSuggestion } from "@/app/types/aiFunctionTypes";

export const createVacation = async (
  profile: Profile | null,
  travelPreferences: TravelPreferences
) => {
  if (!profile) {
    throw new Error("No profile was found.");
  }
  try {
    const prompt = `Act as a vacation travel planner. Based on the profile information and travel preferences provided, create a detailed vacation plan with real-world, verifiable options only. Ensure the output is in JSON format with keys: title, totalPrice, flights, hotels, itinerary, bestTravelDates, and a brief description.

      Profile Information:
      - Age: ${profile.age}
      - Interests: ${profile.interests}
      - Foods: ${profile.foods}
      - Location: Austin, TX

      Travel Preferences:
      - Budget: ${travelPreferences.budget}
      - Travel Month: ${travelPreferences.travelMonth}
      - Climate Preference: ${travelPreferences.climatePreference}
      - Travel Method: ${travelPreferences.travelMethod}
      - Number of Travelers: ${travelPreferences.numberOfTravelers}
      - Trip Style: ${travelPreferences.tripStyle}
      - Number of Days: ${travelPreferences.numberOfDays}
      - Destination?: ${travelPreferences.destination}

      Ensure:
      - Choose the best dates for the vacation based on the budget. For lower budgets, consider off-peak seasons or promotions. For higher budgets, consider peak seasons and special events.
      - Only use real and available hotels, flights, and activities.
      - If the suggested hotel or activity does not exist in reality, replace it with a valid alternative.
      - Provide a creative, real vacation title.
      - Include real cost estimates for flights and hotels from reputable sources.
      - Add a brief description explaining why this vacation was chosen, particularly how it aligns with the user’s preferences and budget.

      Ensure the final result is structured as:

      {
        "title": "Your vacation title here",
        "totalPrice": I will handle this calculation,
        "flights": {
          "from": "Departure City",
          "to": "Destination City",
          "roundTripCost": <Round trip flight cost as a number>,
          "taxes": <Taxes on flights as a number>,
          "totalFlightCost": <Total flight cost including taxes as a number>,
        },
        "hotels": {
          "name": "Hotel name",
          "location": "Hotel address with it's zipcode",
          "phoneNumber": "Phone number for the hotel",
          "nightlyPrice": <Nightly cost here as a number>,
          "taxes": <Taxes on hotel as a number>,
          "totalStayCost": <Total hotel cost including taxes as a number>,
        },
        "itinerary": [
          ${Array.from(
            { length: travelPreferences.numberOfDays ?? 0 },
            (_, i) => {
              return `{
              "day": ${i + 1},
              "description": "Description of activities for day ${i + 1}",
              "estimatedCost": <Cost estimate for day ${i + 1}>
              }`;
            }
          ).join(",\n")}
        ],
        "bestTravelDates": {
          "start": "Suggested start date",
          "end": "Suggested end date",
          "reason": "A brief description of why these dates were chosen."
        },
        "vacationDescription": "A brief description of why this vacation was chosen.",
      }
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Unauthorized");
    }

    const suggestion = JSON.parse(completion.choices[0].message.content || "");

    const flightsTotal = Number(suggestion.flights.totalFlightCost);
    const stayTotal = Number(suggestion.hotels.totalStayCost);
    const itineraryTotal = suggestion.itinerary.reduce(
      (acc: number, day: ItineraryDay) => {
        return acc + Number(day.estimatedCost);
      },
      0
    );
    const totalPrice = flightsTotal + stayTotal + itineraryTotal;

    const cleanSuggestion: VacationSuggestion = {
      title: String(suggestion.title),
      totalPrice: totalPrice,
      flights: {
        from: String(suggestion.flights.from),
        to: String(suggestion.flights.to),
        roundTripCost: Number(suggestion.flights.roundTripCost),
        taxes: Number(suggestion.flights.taxes),
        totalFlightCost: flightsTotal,
      },
      hotels: {
        name: String(suggestion.hotels.name),
        location: String(suggestion.hotels.location),
        phoneNumber: String(suggestion.hotels.phoneNumber),
        nightlyPrice: Number(suggestion.hotels.nightlyPrice),
        taxes: Number(suggestion.hotels.taxes),
        totalStayCost: stayTotal,
      },
      itinerary: Array.isArray(suggestion.itinerary)
        ? suggestion.itinerary.map((day: ItineraryDay) => ({
            day: Number(day.day),
            description: String(day.description),
            estimatedCost: Number(day.estimatedCost),
          }))
        : [],
      bestTravelDates: {
        start: String(suggestion.bestTravelDates.start),
        end: String(suggestion.bestTravelDates.end),
        reason: String(suggestion.bestTravelDates.reason),
      },
      vacationDescription: String(suggestion.vacationDescription),
    };

    const { data, error } = await supabase
      .from("vacation_suggestions")
      .insert({
        profile_id: profile.id,
        suggestion: cleanSuggestion,
      })
      .select()
      .single();

    if (error) {
      throw new Error("Failed to store the vacation:", error);
    }

    return data.id;
  } catch (error) {
    throw error;
  }
};
