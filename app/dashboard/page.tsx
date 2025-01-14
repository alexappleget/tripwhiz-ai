"use client";

import { createVacation } from "@/supabase/aiFunctions";
import { getUserProfile } from "@/supabase/supabaseFunctions";
import { useEffect, useState } from "react";
import { Profile } from "../types/Profile";

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const response = await getUserProfile();
      setProfile(response);
    };

    fetchUserProfile();
  }, []);

  const handleVacation = async () => {
    if (profile) {
      const response = await createVacation(profile);
      console.log(response);
    }
  };

  return <button onClick={handleVacation}>Generate Vacation</button>;
}
