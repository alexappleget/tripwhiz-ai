"use client";

import { getUserProfile } from "@/supabase/supabaseFunctions";
import { zodResolver } from "@hookform/resolvers/zod";
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

function Onboarding() {
  const [name, setName] = useState<string | null>("");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

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

      console.log(response);
    };

    fetchUserProfile();
  }, [form]);

  return <div></div>;
}
