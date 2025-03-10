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
        <div className="grid gap-4">
          <div className="space-y-2">
            <Link href="" className="font-medium leading-none hover:underline">
              View Profile
            </Link>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4 hover:underline">
              <Link href="">Edit Profile</Link>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 hover:underline">
              <Link href="">asdf</Link>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 hover:underline">
              <Link href="">asdf</Link>
            </div>
            <div className="grid grid-cols-3 items-center gap-4 hover:underline">
              <LogoutButton setOpen={setOpen} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
