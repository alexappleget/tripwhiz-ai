"use client";

import { Button } from "@/components/Button/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form/form";
import { Input } from "@/components/Input/input";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/RadioGroup/radio-group";
import { createVacation } from "@/supabase/aiFunctions";
import { getUserProfile } from "@/supabase/supabaseFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Profile } from "../types/Profile";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  budget: z.enum(
    ["More on the cheaper side", "Money isn't an issue", "Broke but boujee"],
    {
      message: "Please select your budget style.",
    }
  ),
  climatePreference: z.enum(["Colder", "Warmer"], {
    message: "Please select a climate preference.",
  }),
  travelMethod: z.enum(["Drive", "Fly"], {
    message:
      "Please specify whether you would like to drive or take a flight to your destination.",
  }),
  numberOfTravelers: z.coerce.number().min(1, {
    message: "Please provide how many travelers there will be.",
  }),
  tripStyle: z.enum(["Adventurous", "Cultural", "Luxury", "Relaxing"], {
    message: "Please specify your trip style.",
  }),
  numberOfDays: z.coerce.number().min(1, {
    message: "Please provide a valid amount of days.",
  }),
  travelMonth: z.string().min(3, {
    message: "Please provide a valid month",
  }),
  destination: z.string().optional(),
});

export default function CreateVacation() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      budget: undefined,
      climatePreference: undefined,
      travelMethod: undefined,
      numberOfTravelers: 0,
      tripStyle: undefined,
      numberOfDays: 0,
      travelMonth: "",
      destination: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getUserProfile();
      setProfile(response);
    };
    fetchUserProfile();
  }, []);

  const onSubmit = async (travelPreferences: z.infer<typeof formSchema>) => {
    if (!profile) {
      throw new Error("Profile not found");
    }
    try {
      const id = await createVacation(profile, travelPreferences);
      console.log(id);
      // router.push(`/vacations/${id}`);
    } catch (error) {
      throw error;
    }
  };

  return (
    <section className="flex flex-col justify-center px-4 md:px-16 lg:px-32 xl:px-52 pt-12">
      <div>
        <Link href="/dashboard" className="flex items-center gap-1 text-sm m-5">
          <ChevronLeft size={16} strokeWidth={2.25} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="w-full flex flex-col justify-center items-center xl:w-1/2 mb-5">
          <h2 className="font-bold m-5">Create Your Next Vacation!</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem className="space-y-3 m-5">
                    <FormLabel>Budget:</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="More on the cheaper side" />
                          </FormControl>
                          <FormLabel>More on the Cheaper Side</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Money isn't an issue" />
                          </FormControl>
                          <FormLabel>Money isn&apos;t an issue</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Broke but boujee" />
                          </FormControl>
                          <FormLabel>Broke but Boujee</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Climate Preference */}
              <FormField
                control={form.control}
                name="climatePreference"
                render={({ field }) => (
                  <FormItem className="space-y-3 m-5">
                    <FormLabel>What climate do you prefer?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Colder" />
                          </FormControl>
                          <FormLabel>Colder</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Warmer" />
                          </FormControl>
                          <FormLabel>Warmer</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Method */}
              <FormField
                control={form.control}
                name="travelMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3 m-5">
                    <FormLabel>What travel method do you prefer?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Drive" />
                          </FormControl>
                          <FormLabel>Drive</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Fly" />
                          </FormControl>
                          <FormLabel>Fly</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Number of Travelers */}
              <FormField
                control={form.control}
                name="numberOfTravelers"
                render={({ field }) => (
                  <FormItem className="m-5">
                    <FormLabel>Number of Travelers:</FormLabel>
                    <FormControl>
                      <Input
                        className="w-4/5"
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trip Style */}
              <FormField
                control={form.control}
                name="tripStyle"
                render={({ field }) => (
                  <FormItem className="space-y-3 m-5">
                    <FormLabel>What trip style do you want?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Adventurous" />
                          </FormControl>
                          <FormLabel>Adventurous</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Cultural" />
                          </FormControl>
                          <FormLabel>Cultural</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Luxury" />
                          </FormControl>
                          <FormLabel>Luxury</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Relaxing" />
                          </FormControl>
                          <FormLabel>Relaxing</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Number of Days */}
              <FormField
                control={form.control}
                name="numberOfDays"
                render={({ field }) => (
                  <FormItem className="m-5">
                    <FormLabel>
                      How many days do you want your vacation?
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-4/5"
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Travel Month */}
              <FormField
                control={form.control}
                name="travelMonth"
                render={({ field }) => (
                  <FormItem className="m-5">
                    <FormLabel>What month would you like to travel?</FormLabel>
                    <FormControl>
                      <Input className="w-4/5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Optional Destination */}
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="m-5">
                    <FormLabel>Destination (Optional):</FormLabel>
                    <FormControl>
                      <Input className="w-4/5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="m-5" type="submit">
                Find My Vacation
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  );
}
