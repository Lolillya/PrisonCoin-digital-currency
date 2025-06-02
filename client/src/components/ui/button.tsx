import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
};

export const Button = ({ children }: ButtonProps) => {
  return (
    <button className="bg-primary text-text p-4 text-lg tracking-wider rounded w-full cursor-pointer hover:bg-secondary transition-colors duration-200 ">
      {children}
    </button>
  );
};
