"use server";

import { createClient } from "./server";

export const getAllUserVacations = async () => {
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
      .eq("profile_id", session.user.id);

    if (!data) {
      throw new Error("Failed to fetch data.");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentVacation = async ({ id }: { id: string }) => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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
  address,
  city,
  state,
  onboarding_complete,
}: {
  age: number;
  display_name: string;
  interests: string;
  foods: string[];
  address: string;
  city: string;
  state: string;
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
        address,
        city,
        state,
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

export const getUserAvatar = async () => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No user found");
    }

    const userAvatarUrl = user.user_metadata.avatar_url;

    return userAvatarUrl;
  } catch (error) {
    throw error;
  }
};
