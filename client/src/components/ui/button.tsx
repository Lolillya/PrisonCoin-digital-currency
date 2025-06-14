import type { ReactNode, MouseEvent } from "react";

type ButtonProps = {
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export const Button = ({
  children,
  type = "button",
  disabled = false,
  onClick,
  className,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`bg-primary text-white p-4 text-lg tracking-wider rounded-4xl w-full cursor-pointer hover:bg-secondary transition-colors duration-200 ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
