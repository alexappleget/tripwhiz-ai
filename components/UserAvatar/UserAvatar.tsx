import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export const UserAvatar = ({ src }: { src: string }) => {
  return (
    <Avatar>
      <AvatarImage src={src} alt="Your avatar photo for your profile" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
