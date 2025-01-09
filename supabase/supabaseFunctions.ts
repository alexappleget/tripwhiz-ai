"use server";

import { createClient } from "./server";

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
  gender,
  disabilities,
  interests,
  fears,
  foods,
  onboarding_complete,
}: {
  age: string;
  display_name: string;
  gender: string;
  disabilities?: string;
  interests: string;
  fears: string[];
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
        gender,
        disabilities,
        interests,
        fears,
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
