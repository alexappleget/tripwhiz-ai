"use client";

import { Button } from "@/components/Button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/Card/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Plane,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Form/form";
import { Input } from "@/components/Input/input";
import { Progress } from "@/components/Progress/progress";
import {
  getUserProfile,
  updateUserProfile,
} from "@/supabase/supabaseFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/Textarea/textarea";
import { MultiSelect } from "@/components/MultiSelect/multi-select";
import { foodOptions, states } from "./formValues";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/Popover/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/Command/command";

const stepOneSchema = z.object({});

const stepTwoSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.coerce.number().min(1, {
    message: "Please enter your age.",
  }),
});

const stepThreeSchema = z.object({
  interests: z.string().min(2, {
    message:
      "I need a little more information about your interests to find the perfect vacation for you. Please share some activities or hobbies.",
  }),
});

const stepFourSchema = z.object({
  foods: z.array(z.string()).min(1, {
    message: "Please choose at least 1 food option",
  }),
});

const stepFiveSchema = z.object({
  address: z.string().min(5, {
    message: "Please provide your full address.",
  }),
  city: z.string().min(3, {
    message: "Please enter your city.",
  }),
  state: z.string({
    message: "Please select your state",
  }),
});

// Combined schema for the entire form
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.coerce.number().min(1, {
    message: "Please provide your age.",
  }),
  interests: z.string().min(2, {
    message:
      "I need a little more information about your interests to find the perfect vacation for you. Please share some activities or hobbies.",
  }),
  foods: z.array(z.string()).min(1, {
    message: "Please choose at least 1 food option.",
  }),
  address: z.string().min(5, {
    message: "Please provide your full address.",
  }),
  city: z.string().min(3, {
    message: "Please enter your city.",
  }),
  state: z.string({
    message: "Please select your state",
  }),
});

type Step = {
  title: string;
  description: string;
  schema: z.AnyZodObject;
};

const steps: Step[] = [
  {
    title: "Welcome to TripWhiz AI",
    description:
      "To better assist and find the most accurate vacation for you, please answer each question as thorough as possible.",
    schema: stepOneSchema,
  },
  {
    title: "About You",
    description: "First let's get to know each other",
    schema: stepTwoSchema,
  },
  {
    title: "Your Interests",
    description:
      "Tell me about your interests so I can better tailor your next vacation. The more information you provide, the better I can assist you.",
    schema: stepThreeSchema,
  },
  {
    title: "Favorite Foods",
    description: "Tell me about what types of food you enjoy eating.",
    schema: stepFourSchema,
  },
  {
    title: "Your location",
    description:
      "Provide your address, city and state so I know where you'll be traveling from.",
    schema: stepFiveSchema,
  },
];

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center text-white text-2xl">Loading...</div>
      }
    >
      <Onboarding />
    </Suspense>
  );
}

const Onboarding = () => {
  const [name, setName] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: {
      name: "",
      age: 0,
      interests: "",
      foods: [],
      address: "",
      city: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getUserProfile();

      setName(response.display_name);
      form.setValue("name", response.display_name);
      form.setValue("age", response.age);
      form.setValue("interests", response.interests);
      form.setValue("foods", response.foods);
      form.setValue("address", response.address);
      form.setValue("city", response.city);
      form.setValue("state", response.state);
    };

    fetchUserProfile();
  }, [form]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    if (currentStep === steps.length - 1) {
      try {
        const formData = form.getValues();

        await updateUserProfile({
          age: formData.age,
          display_name: formData.name,
          interests: formData.interests,
          foods: formData.foods || [],
          address: formData.address,
          city: formData.city,
          state: formData.state,
          onboarding_complete: true,
        });

        setIsSubmitted(true);

        router.push("/dashboard");
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      next();
    }
  };

  return (
    <main className="w-full h-full flex flex-col items-center justify-center pt-20">
      <div className="max-w-lg">
        <Progress
          value={isSubmitted ? 100 : (currentStep / steps.length) * 100}
          className="my-4"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription className="text-center">
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent>
                {currentStep === 0 && (
                  <>
                    <div className="w-fit p-3 rounded-full mx-auto">
                      <Plane />
                    </div>
                    <h3 className="font-bold text-center mb-2">
                      Hello, {name}!
                    </h3>
                    <p className="text-center">
                      Our travel planner AI is designed to make planning your
                      next vacation effortless! In just minutes, our advanced
                      technology will craft the perfect vacation for you.
                    </p>
                  </>
                )}
                {currentStep === 1 && (
                  <>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What should I call you?</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            This is how I will best know what to call you
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What is your current age?</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || 0}
                              type="number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="interests"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell me about your interests</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share some of your favorite activities or hobbies. And even types of vacations you enjoyed."
                              className="resize-none"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="foods"
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Do you have any favorite foods?</FormLabel>
                          <Controller
                            control={form.control}
                            name="foods"
                            render={({ field }) => (
                              <MultiSelect
                                options={foodOptions}
                                value={field.value || []}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="flex flex-col mb-2 w-full">
                          <FormLabel>Address:</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2 items-center py-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-1/2">
                            <FormLabel>City:</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-1/2">
                            <FormLabel>State:</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value
                                      ? states.find(
                                          (state) => state.value === field.value
                                        )?.label
                                      : "Select state"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-52 p-0">
                                <Command>
                                  <CommandInput placeholder="Search state..." />
                                  <CommandList>
                                    <CommandEmpty>No state found.</CommandEmpty>
                                    <CommandGroup>
                                      {states.map((state) => (
                                        <CommandItem
                                          value={state.label}
                                          key={state.value}
                                          onSelect={() => {
                                            form.setValue("state", state.value);
                                          }}
                                        >
                                          {state.label}
                                          <Check
                                            className={cn(
                                              "ml-auto",
                                              state.value === field.value
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                          />
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter>
                <div
                  className={
                    "flex w-full " +
                    (currentStep === 0 ? "justify-end" : "justify-between")
                  }
                >
                  {currentStep !== 0 && (
                    <Button type="button" variant="secondary" onClick={back}>
                      <ChevronLeft />
                      Back
                    </Button>
                  )}
                  <Button type="submit">
                    {currentStep < steps.length - 1
                      ? "Next"
                      : "Find My Perfect Vacation"}
                    <ChevronRight />
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </main>
  );
};
