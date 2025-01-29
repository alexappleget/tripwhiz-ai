export interface FlightDetails {
  from: string;
  to: string;
  roundTripCost: number;
  taxes: number;
  totalFlightCost: number;
}

export interface HotelDetails {
  name: string;
  location: string;
  phoneNumber: string;
  nightlyPrice: number;
  taxes: number;
  totalStayCost: number;
}

export interface ItineraryDay {
  day: number;
  description: string;
  estimatedActivityCost: number;
  estimatedTravelCost: number;
}

export interface TravelDates {
  start: string;
  end: string;
  reason: string;
}

export interface VacationSuggestion {
  title: string;
  totalPrice: number;
  flights: FlightDetails;
  hotels: HotelDetails;
  itinerary: ItineraryDay[];
  bestTravelDates: TravelDates;
  vacationDescription: string;
}
