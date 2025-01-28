"use server";

import { createClient } from "./server";

export const getVacation = async ({ id }: { id: string }) => {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const { data } = await supabase
      .from("vacation_suggestions")
      .select()
      .eq("id", id);

    if (!data) {
      throw new Error("Failed to fetch data.");
    }

    return data[0].suggestion;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async ({
  age,
  display_name,
  interests,
  foods,
  onboarding_complete,
}: {
  age: number;
  display_name: string;
  interests: string;
  foods: string[];
  onboarding_complete: boolean;
}) => {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("Unauthorized");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        age,
        display_name,
        interests,
        foods,
        onboarding_complete,
      })
      .eq("id", session.user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};
