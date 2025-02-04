"use server";

import { openai } from "@/config/openAIConfig";
import { createClient } from "./server";
import { Profile } from "@/app/types/Profile";
import { TravelPreferences } from "@/app/types/TravelPreferences";
import {
  DrivingDetails,
  FlightDetails,
  ItineraryDay,
  VacationSuggestion,
} from "@/app/types/aiFunctionTypes";

export const createVacation = async (
  profile: Profile | null,
  travelPreferences: TravelPreferences
) => {
  if (!profile) {
    throw new Error("No profile was found.");
  }

  const travelMethodInstructions = () => {
    if (travelPreferences.travelMethod === "Fly") {
      return "- Find real round-trip flights for the given budget. Provide the total cost including taxes.";
    }
    if (travelPreferences.travelMethod === "Drive") {
      return "- Calculate the total driving cost based on gas mileage. Assume an average fuel economy of 25 miles per gallon and a gas price of $3.00 per gallon. Provide the estimated fuel cost and total driving distance.";
    }
  };

  try {
    const prompt = `Act as a vacation travel planner. Based on the profile information and travel preferences provided, create a detailed vacation plan with real-world, verifiable options only. Ensure the output is in JSON format with keys: title, totalPrice, flights, hotels, itinerary, bestTravelDates, and a brief description. Surprise the user with unique experiences they might not expect but still align with their preferences.

      Profile Information:
      - Age: ${profile.age}
      - Interests: ${
        profile.interests
      }. Do not focus solely on one interest—create a well-balanced vacation that includes a mix of them.
      - Foods: ${profile.foods}
      - Departure Location (MUST be used for all travel calculations): ${
        profile.city
      }, ${profile.state}

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
      - ${travelMethodInstructions}
      - All travel plans, whether flights or driving, MUST use ${
        profile.city
      }, ${profile.state} as the starting location.
      - Only use real and available hotels, flights, and activities.
      - If the suggested hotel or activity does not exist in reality, replace it with a valid alternative.
      - Provide a creative, real vacation title.
      - Include real cost estimates for flights and hotels from reputable sources.
      - Add a brief description explaining why this vacation was chosen, particularly how it aligns with the user’s preferences and budget.

      Ensure the final result is structured as:

      {
        "title": "Your vacation title here",
        "totalPrice": I will handle this calculation,
        ${
          travelPreferences.travelMethod === "Fly" &&
          `
          "flights": {
            "from": "${profile.city}, ${profile.state}",
            "to": "Destination City",
            "roundTripCost": <Round trip flight cost as a number>,
            "taxes": <Taxes on flights as a number>,
            "totalFlightCost": <Total flight cost including taxes as a number>,
          },`
        }
        ${
          travelPreferences.travelMethod === "Drive" &&
          `
          "driving": {
            "startingLocation": "${profile.city}, ${profile.state}",
            "distance": <total miles from user's location to the destination city>,
            "fuelCost": <total fuel cost>,
            "gasPricePerGallon": 3.00
          },`
        }
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
              "estimatedActivityCost": <Cost estimate for day ${
                i + 1
              }'s activity>
              "estimatedTravelCost": <Cost estimate for traveling from the hotel's address to the activity>
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

    let totalTravelCost = 0;
    let flightDetails: FlightDetails | undefined;
    let drivingDetails: DrivingDetails | undefined;

    if (travelPreferences.travelMethod === "Fly") {
      totalTravelCost = Number(suggestion.flights.totalFlightCost);
      flightDetails = {
        from: String(suggestion.flights.from),
        to: String(suggestion.flights.to),
        roundTripCost: Number(suggestion.flights.roundTripCost),
        taxes: Number(suggestion.flights.taxes),
        totalFlightCost: Number(suggestion.flights.totalFlightCost),
      };
    }

    if (travelPreferences.travelMethod === "Drive") {
      totalTravelCost = Number(suggestion.driving.fuelCost);
      drivingDetails = {
        startingLocation: String(suggestion.driving.startingLocation),
        distance: Number(suggestion.driving.distance),
        fuelCost: Number(suggestion.driving.fuelCost),
        gasPricePerGallon: Number(suggestion.driving.gasPricePerGallon),
      };
    }

    const stayTotal = Number(suggestion.hotels.totalStayCost);
    const itineraryTotal = suggestion.itinerary.reduce(
      (acc: number, day: ItineraryDay) => {
        return (
          acc +
          Number(day.estimatedActivityCost) +
          Number(day.estimatedTravelCost)
        );
      },
      0
    );

    const totalPrice = totalTravelCost + stayTotal + itineraryTotal;

    const cleanSuggestion: VacationSuggestion = {
      title: String(suggestion.title),
      totalPrice: totalPrice,
      ...(travelPreferences.travelMethod === "Fly" && {
        flights: flightDetails,
      }),
      ...(travelPreferences.travelMethod === "Drive" && {
        driving: drivingDetails,
      }),
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
            estimatedActivityCost: Number(day.estimatedActivityCost),
            estimatedTravelCost: Number(day.estimatedTravelCost),
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
