import type { SVGProps } from "react";

/** The little robot that stands for Anike in the nav and the chat heading. */
export default function RobotIcon({
  children,
  size = 17,
  ...props
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
      <path d="M12 3v3M10.5 3h3" />
      <rect x="4" y="6" width="16" height="15" rx="3" />
      <path d="M1.5 11v5M22.5 11v5M9 17h6" />
      <circle cx="8.5" cy="11.5" r="1" />
      <circle cx="15.5" cy="11.5" r="1" />
    </svg>
  );
}
