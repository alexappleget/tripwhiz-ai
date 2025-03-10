"use client";

import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "../Button/button";

export const LogoutButton = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setOpen(false);
      router.push("/");
    } catch (error) {
      throw error;
    }
  };

  return <Button onClick={handleLogOut}>Log Out</Button>;
};
