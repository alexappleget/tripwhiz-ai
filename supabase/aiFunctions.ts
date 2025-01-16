"use server";

import { openai } from "@/config/openAIConfig";
import { createClient } from "./server";
import { Profile } from "@/app/types/Profile";
import { TravelPreferences } from "@/app/types/TravelPreferences";

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
        - Hotel recommendations with nightly prices and total stay costs, including taxes.
        - A detailed, day-by-day itinerary with a price estimate for each activity. Include activities that reflect the profile's interests and preferences.
        - Keep the over JSON structure similar to this format:

        {
          "title": "Your vacation title here",
          "totalPrice": "Total cost here",
          "flights": {
            "from": "Departure City",
            "to": "Destination City",
            "roundTripCost": "Round trip flight cose here",
            "taxes": "Taxes on flights here",
            "totalFlightCost": "Total flight cost including taxes",
          },
          "hotels": [
            {
              "name": "Hotel name here",
              "location": "Hotel location here",
              "nightlyPrice": "Nightly cost here",
              "totalStayCost": "Total stay cost including taxes here",
              "taxesIncluded": "Total taxes included here",
            }
          ],
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

    const parsedResponse = JSON.parse(
      completion.choices[0].message.content || ""
    );

    return parsedResponse;
  } catch (error) {
    throw error;
  }
};
