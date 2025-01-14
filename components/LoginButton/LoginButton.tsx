"use client";

import { signInWithGoogle } from "@/supabase/googleAuthFunction";
import { Button } from "../Button/button";

const LoginButton = () => {
  const signIn = async () => {
    try {
      await signInWithGoogle({});
    } catch (error) {
      throw error;
    }
  };

  return (
    <Button
      className="bg-sky-500 hover:bg-sky-600 text-white text-lg px-8 py-3"
      size="lg"
      onClick={signIn}
    >
      Sign In
    </Button>
  );
};

export default LoginButton;
