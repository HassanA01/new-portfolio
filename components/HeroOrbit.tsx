import { PropsWithChildren } from "react";

const HeroOrbit = ({
  children,
  size,
  rotation,
  opacity,
}: PropsWithChildren<{ size: number; rotation: number; opacity: number }>) => {
  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        height: `${size}px`,
        width: `${size}px`,
        opacity: `${opacity}%`,
      }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
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
  );
};

export default HeroOrbit;
