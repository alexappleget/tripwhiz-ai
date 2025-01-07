import { redirect } from "next/navigation";
import { createClient } from "./client";

export const signInWithGoogle = async (options?: { redirectPath?: string }) => {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: options?.redirectPath
          ? `${window.location.origin}/auth/callback?redirect_to=${options.redirectPath}`
          : `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      redirect("/auth/error");
    }
  } catch (error) {
    console.error("Error signing in:", error);
    redirect("/auth/error");
  }
};
