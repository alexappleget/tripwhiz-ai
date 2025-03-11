"use client";

import { createClient } from "@/supabase/client";
import { Button } from "../Button/button";
import { useRouter } from "next/navigation";

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

  return (
    <Button onClick={handleLogOut} className="hover:underline">
      Log Out
    </Button>
  );
};
