import type React from "react";

interface Props extends React.ComponentPropsWithRef<"button"> {
  children: React.ReactNode;
  onClick?: () => void;
}

const Button = ({
  children,
  type = "button",
  onClick,
  className = "",
}: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
