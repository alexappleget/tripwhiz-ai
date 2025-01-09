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
import { ChevronLeft, ChevronRight, Plane } from "lucide-react";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/RadioGroup/radio-group";
import { MultiSelect } from "@/components/MultiSelect/multi-select";

const stepOneSchema = z.object({});

const stepTwoSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().min(1, {
    message: "Please enter your age.",
  }),
});

const stepThreeSchema = z.object({
  gender: z.enum(["male", "female", "other"], {
    message: "Please specify your gender.",
  }),
  disabilities: z.string().optional().nullable(),
});

const stepFourSchema = z.object({
  interests: z.string().min(2, {
    message:
      "I need a little more information about your interests to find the perfect vacation for you. Please share some activities or hobbies.",
  }),
});

const stepFiveSchema = z.object({
  fears: z.array(z.string()).optional().nullable(),
});

const stepSixSchema = z.object({
  foods: z.array(z.string()).min(1, {
    message: "Please choose at least 1 food option",
  }),
});

// Combined schema for the entire form
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().min(1, {
    message: "Please provide your age.",
  }),
  gender: z.enum(["male", "female", "other"], {
    message: "Please specify your gender.",
  }),
  disabilities: z.string().optional().nullable(),
  interests: z.string().min(2, {
    message:
      "I need a little more information about your interests to find the perfect vacation for you. Please share some activities or hobbies.",
  }),
  fears: z.array(z.string()).optional().nullable(),
  foods: z.array(z.string()).min(1, {
    message: "Please choose at least 1 food option.",
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
    title: "Personal Information",
    description:
      "Please specify your gender and any disabilities you may have. This is to ensure that I can tailor vacation activities for you.",
    schema: stepThreeSchema,
  },
  {
    title: "Your Interests",
    description:
      "Tell me about your interests so I can better tailor your next vacation. The more information you provide, the better I can assist you.",
    schema: stepFourSchema,
  },
  {
    title: "Fears",
    description:
      "Do you have any fears I should be aware of? I want to be sure to avoid anything based on your fears.",
    schema: stepFiveSchema,
  },
  {
    title: "Favorite Foods",
    description: "Tell me about what types of food you enjoy eating.",
    schema: stepSixSchema,
  },
];

const fearOptions = [
  { value: "acrophobia", label: "Acrophobia (Heights)" },
  { value: "aerophobia", label: "Aerophobia (Flying)" },
  { value: "arachnophobia", label: "Arachnophobia (Spiders)" },
  { value: "claustrophobia", label: "Claustrophobia (Confined Spaces)" },
  { value: "nyctophobia", label: "Nyctophobia (Dark)" },
  { value: "ophidiophobia", label: "Ophidiophobia (Snakes)" },
];

const foodOptions = [
  { value: "bbq", label: "BBQ" },
  { value: "coffee", label: "Coffee" },
  { value: "curry", label: "Curry" },
  { value: "hot dogs", label: "Hot Dogs" },
  { value: "pasta", label: "Pasta" },
  { value: "tacos", label: "Tacos" },
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
      age: "",
      gender: undefined,
      disabilities: undefined,
      interests: "",
      fears: [],
      foods: [],
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getUserProfile();

      setName(response.display_name);
      form.setValue("name", response.display_name);
      form.setValue("age", response.age);
      form.setValue("gender", response.gender);
      form.setValue("disabilities", response.disabilities);
      form.setValue("interests", response.interests);
      form.setValue("fears", response.fears);
      form.setValue("foods", response.foods);
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
          gender: formData.gender,
          disabilities: formData.disabilities || undefined,
          interests: formData.interests,
          fears: formData.fears || [],
          foods: formData.foods || [],
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
    <main className="w-full min-h-screen flex flex-col items-center justify-center">
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
                    <div className="w-fit p-3 rounded-full mx-auto mb-4">
                      <Plane />
                    </div>
                    <h3 className="font-bold text-center">Hello, {name}!</h3>
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
                            <Input {...field} value={field.value || ""} />
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
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Choose a Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="male" />
                                </FormControl>
                                <FormLabel>Male</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="female" />
                                </FormControl>
                                <FormLabel>Female</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="other" />
                                </FormControl>
                                <FormLabel>Other</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disabilities"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Do you have any disabilities?</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="(Optional): Any disabilities that you want me to take into consideration when creating your vacation."
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
                {currentStep === 4 && (
                  <>
                    <FormField
                      control={form.control}
                      name="fears"
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>List of Common Fears</FormLabel>
                          <Controller
                            control={form.control}
                            name="fears"
                            render={({ field }) => (
                              <MultiSelect
                                options={fearOptions}
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
                {currentStep === 5 && (
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
