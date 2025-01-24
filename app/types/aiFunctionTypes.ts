export interface FlightDetails {
  from: string;
  to: string;
  roundTripCost: string;
  taxes: string;
  totalFlightCost: string;
}

export interface HotelDetails {
  name: string;
  location: string;
  nightlyPrice: string;
  taxes: string;
  totalStayCost: string;
}

export interface ItineraryDay {
  day: number;
  description: string;
  estimatedCost: string;
}

export interface VacationSuggestion {
  title: string;
  totalPrice: string;
  flights: FlightDetails;
  hotels: HotelDetails;
  itinerary: ItineraryDay[];
}
