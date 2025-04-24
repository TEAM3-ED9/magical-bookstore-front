"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { cn } from "@/lib/utils"; // Ajusta esto si no tienes la función cn

const MouseEnterContext = createContext();

export const CardContainer = ({ children, className = "", containerClassName = "" }) => {
  const containerRef = useRef(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) - rect.width / 2) / 10;
    const y = -((e.clientY - rect.top) - rect.height / 2) / 10;

    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    if (containerRef.current) {
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    }
  };

  return (
    <MouseEnterContext.Provider value={isMouseEntered}>
      <div
        className={cn("py-20 flex items-center justify-center", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative transition-transform duration-300 ease-out",
            className
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({ children, className = "" }) => {
  return (
    <div className={cn("h-96 w-96", className)}>
      {children}
    </div>
  );
};

export const CardItem = ({
  children,
  className = "",
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
}) => {
  const ref = useRef(null);
  const isMouseEntered = useContext(MouseEnterContext);

  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
      ref.current.style.transition = "transform 0.5s ease-out";
    } else {
      ref.current.style.transform = `translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  }, [isMouseEntered]);

  return (
    <div
      ref={ref}
      className={cn("transition-transform duration-500", className)}
    >
      {children}
    </div>
  );
};
