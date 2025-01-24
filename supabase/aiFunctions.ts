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
    const prompt = `Act as a vacation travel planner. Based on the profile information and travel preferences provided, create a detailed vacation plan within the specified budget. Ensure the output is in JSON format with keys: title, totalPrice, flights, hotels, and itinerary. The itinerary should be detailed with the day's activity, price estimates, and the day's description.

        Profile Information:
        - Age: ${profile.age}
        - Interests: ${profile.interests}
        - Foods: ${profile.foods}
        - Location: Austin, TX

        Travel Preferences:
        - Travel Month: ${travelPreferences.travelMonth}
        - Climate Preference: ${travelPreferences.climatePreference}
        - Travel Method: ${travelPreferences.travelMethod}
        - Number of Travelers: ${travelPreferences.numberOfTravelers}
        - Trip Style: ${travelPreferences.tripStyle}
        - Budget: $${travelPreferences.budget}
        - Number of Days: ${travelPreferences.numberOfDays}

        Ensure the final result includes:
        - A creative title for the vacation.
        - A total price within the $${travelPreferences.budget} budget.
        - Estimated flight cost, including taxes, from the closest airport to Austin, TX.
        - Hotel recommendation with estimated cost, including taxes.
        - A detailed, day-by-day itinerary where:
          - The first day is a travel day with limited activities, such as arrival, check-in, and a light exploration of the area.
          - The last day is a travel day with minimal activities, such as packing, breakfast, and departure.
          - The remaining days include activities reflecting the profile's interests and preferences.
        - Keep the over JSON structure similar to this format:

        {
          "title": "Your vacation title here",
          "totalPrice": "Total cost here",
          "flights": {
            "from": "Departure City",
            "to": "Destination City",
            "roundTripCost": "Round trip flight cost here",
            "taxes": "Taxes on flights here",
            "totalFlightCost": "Total flight cost including taxes",
          },
          "hotels": {
            "name": "Hotel name here",
            "location": "Hotel location here",
            "nightlyPrice": "Nightly cost here",
            "taxes": "Total on hotel",
            "totalStayCost": "Total hotel cost including taxes",
          },
          "itinerary": [
            ${Array.from({ length: travelPreferences.numberOfDays }, (_, i) => {
              return `{
                "day": ${i + 1},
                "description": "Description of activities for day ${i + 1}",
                "estimatedCost": "Cost estimate for day ${i + 1}"
              }`;
            }).join(",\n")}
          ]
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

    const cleanSuggestion: VacationSuggestion = {
      title: String(suggestion.title),
      totalPrice: String(suggestion.totalPrice),
      flights: {
        from: String(suggestion.flights.from),
        to: String(suggestion.flights.to),
        roundTripCost: String(suggestion.flights.roundTripCost),
        taxes: String(suggestion.flights.taxes),
        totalFlightCost: String(suggestion.flights.totalFlightCost),
      },
      hotels: {
        name: String(suggestion.hotels.name),
        location: String(suggestion.hotels.location),
        nightlyPrice: String(suggestion.hotels.nightlyPrice),
        taxes: String(suggestion.hotels.taxes),
        totalStayCost: String(suggestion.hotels.totalStayCost),
      },
      itinerary: Array.isArray(suggestion.itinerary)
        ? suggestion.itinerary.map((day: ItineraryDay) => ({
            day: Number(day.day),
            description: String(day.description),
            estimatedCost: String(day.estimatedCost),
          }))
        : [],
    };

    const { error: vacationError } = await supabase.from("").insert({});

    if (vacationError) {
      console.error("Failed to store the vacation:", vacationError);
    }

    return cleanSuggestion;
  } catch (error) {
    throw error;
  }
};
