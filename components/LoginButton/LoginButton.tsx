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
    <Button size="lg" onClick={signIn}>
      Sign In
    </Button>
  );
};

export default LoginButton;
