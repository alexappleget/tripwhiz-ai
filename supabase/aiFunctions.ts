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

  const currentYear = new Date().getFullYear();

  let travelInstructions = "";

  switch (travelPreferences.travelMethod) {
    case "Fly":
      travelInstructions = `- Find real round-trip flights for the given budget. Provide the total cost including taxes.`;
      break;
    case "Drive":
      travelInstructions = `- Calculate the total driving cost based on gas mileage. Assume an average fuel economy of 25 miles per gallon and a gas price of $3.00 per gallon. Provide the estimated fuel cost and total driving distance.`;
      break;
  }

  try {
    const prompt = `Act as a vacation travel planner. Based on the profile information and travel preferences provided, create a detailed vacation plan with real-world, verifiable options only. Ensure the output is in JSON format with keys: title, totalPrice, flights, hotels, itinerary, bestTravelDates, and a brief description. Surprise the user with unique experiences they might not expect but still align with their preferences.

      Profile Information:
      - Age: ${profile.age}
      - Interests: ${profile.interests}. Do not focus solely on one interest—create a well-balanced vacation that includes a mix of them.
      - Foods: ${profile.foods}
      - Departure Location (MUST be used for all travel calculations): ${profile.address} ${profile.city}, ${profile.state}

      Travel Preferences:
      - Budget: ${travelPreferences.budget}
      - Travel Month: ${travelPreferences.travelMonth}
      - Climate Preference: ${travelPreferences.climatePreference}
      - Travel Method: ${travelPreferences.travelMethod}
      - Trip Style: ${travelPreferences.tripStyle}
      - Number of Days: ${travelPreferences.numberOfDays}
      - Destination?: ${travelPreferences.destination}

      Ensure:
      - Choose the best dates for the vacation based on the budget. For lower budgets, consider off-peak seasons or promotions. For higher budgets, consider peak seasons and special events. The current year is: ${currentYear}.
      - ${travelInstructions}.
      - All travel plans, whether flights or driving, MUST use ${profile.address} ${profile.city}, ${profile.state} as the starting location.
      - Only use real and available hotels, flights, and activities.
      - If the suggested hotel or activity does not exist in reality, replace it with a valid alternative.
      - Provide a creative, real vacation title.
      - Include real cost estimates for flights and hotels from reputable sources.
      - Add a brief description explaining why this vacation was chosen, particularly how it aligns with the user’s preferences and budget.

      Your response must be a single valid JSON object with the following structure:
      1. "title": String - creative vacation title
      2. If travel method is "Fly", include "flights" object with: 
        - "from": String - departure city/state
        - "to": String - destination city
        - "roundTripCost": Number - base cost
        - "taxes": Number - taxes and fees
        - "totalFlightCost": Number - total flight cost
      3. If travel method is "Drive", include "driving" object with:
        - "startingLocation": String - starting address
        - "distance": Number - total miles
        - "fuelCost": Number - estimated fuel cost
        - "gasPricePerGallon": Number - gas price (use 3.00)
      4. "hotels" object with:
        - "name": String - hotel name
        - "location": String - full address with zip code
        - "phoneNumber": String - contact number
        - "nightlyPrice": Number - cost per night
        - "taxes": Number - taxes and fees
        - "totalStayCost": Number - total accommodation cost
      5. "itinerary": Array of day objects, each containing:
        - "day": Number - day number (1, 2, etc)
        - "description": String - detailed day activities
        - "estimatedActivityCost": Number - activity costs
        - "estimatedTravelCost": Number - local travel costs
      6. "bestTravelDates" object with:
        - "start": String - start date
        - "end": String - end date
        - "reason": String - reason for date selection
      7. "vacationDescription": String - overall trip description

      Make sure all numerical values are actual numbers (not strings) and ensure the JSON is properly formatted with no syntax errors.
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
