"use client";

import { cn } from "@/lib/utils";
import { UserAvatar } from "../UserAvatar/UserAvatar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserAvatar } from "@/supabase/supabaseFunctions";

export const ProfileHeader = () => {
  const [userAvatar, setUserAvatar] = useState<string>("");
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const response = await getUserAvatar();
      setUserAvatar(response);
    };
    fetchUserAvatar();
  }, []);

  return (
    <nav
      className={cn(
        "flex items-center justify-end px-4 md:px-16 lg:px-32 xl:px-52 h-20 border-b-2",
        pathname === "/" ? "hidden" : ""
      )}
    >
      <UserAvatar src={userAvatar} />
    </nav>
  );
};
