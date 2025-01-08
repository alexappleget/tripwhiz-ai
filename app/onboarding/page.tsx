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
import { useForm } from "react-hook-form";
import { z } from "zod";

const stepOneSchema = z.object({});

const stepTwoSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  age: z.string().min(1, {
    message: "Please enter your age.",
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
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getUserProfile();

      setName(response.display_name);
      form.setValue("name", response.display_name);
      form.setValue("age", response.age);
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
