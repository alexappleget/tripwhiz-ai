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
import { MultiSelect } from "@/components/MultiSelect/multi-select";

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
];

const foodOptions = [
  { value: "american", label: "American" },
  { value: "chinese", label: "Chinese" },
  { value: "french", label: "French" },
  { value: "indian", label: "Indian" },
  { value: "italian", label: "Italian" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "mexican", label: "Mexican" },
  { value: "thai", label: "Thai" },
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
