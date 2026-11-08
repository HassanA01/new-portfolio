import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

const HeroOrbit = ({
  children,
  size,
  rotation,
  opacity,
  spinDuration,
  shouldSpin = false,
  orbitDuration,
  shouldOrbit = false,
}: PropsWithChildren<{
  size: number;
  rotation: number;
  opacity: number;
  spinDuration?: string;
  shouldOrbit?: boolean;
  orbitDuration?: string;
  shouldSpin?: boolean;
}>) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div
        className={twMerge(shouldOrbit === true && "animate-spin")}
        style={{
          animationDuration: orbitDuration,
        }}
      >
        <div
          className="flex items-start justify-start"
          style={{
            transform: `rotate(${rotation}deg)`,
            height: `${size}px`,
            width: `${size}px`,
            opacity: `${opacity}%`,
          }}
        >
          <div
            className={twMerge(shouldSpin === true && "animate-spin")}
            style={{ animationDuration: spinDuration }}
          >
            <div
              className="inline-flex"
              style={{
                transform: `rotate(${rotation * -1}deg)`,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroOrbit;
