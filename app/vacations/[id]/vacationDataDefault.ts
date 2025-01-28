import { VacationSuggestion } from "@/app/types/aiFunctionTypes";

export const vacationDataDefault: VacationSuggestion = {
  title: "",
  totalPrice: 0,
  flights: {
    from: "",
    to: "",
    roundTripCost: 0,
    taxes: 0,
    totalFlightCost: 0,
  },
  hotels: {
    name: "",
    location: "",
    phoneNumber: "",
    nightlyPrice: 0,
    taxes: 0,
    totalStayCost: 0,
  },
  itinerary: [],
  bestTravelDates: {
    start: "",
    end: "",
    reason: "",
  },
  vacationDescription: "",
};
