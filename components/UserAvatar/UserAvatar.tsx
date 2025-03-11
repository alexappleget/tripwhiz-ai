import { PopoverTrigger } from "@radix-ui/react-popover";
import { Popover, PopoverContent } from "../Popover/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import Link from "next/link";
import { LogoutButton } from "../LogoutButton/LogoutButton";
import { useState } from "react";

export const UserAvatar = ({ src }: { src: string }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Avatar className="hover:cursor-pointer">
          <AvatarImage src={src} alt="Your avatar photo for your profile" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-52">
        <div className="flex flex-col gap-2">
          <Link href="" className="hover:underline">
            View Profile
          </Link>
          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            className="hover:underline"
          >
            Edit Profile
          </Link>
          <Link href="" className="hover:underline">
            Settings
          </Link>
          <LogoutButton setOpen={setOpen} />
        </div>
      </PopoverContent>
    </Popover>
  );
};
