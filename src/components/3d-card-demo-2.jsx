"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";

export default function ThreeDCardDemo() {
  return (
    <CardContainer>
      <CardBody className="bg-white dark:bg-black border rounded-xl p-6 w-[30rem] shadow-lg">
        <CardItem translateZ={50} className="text-xl font-bold text-neutral-800 dark:text-white">
          Make things float in air
        </CardItem>
        <CardItem translateZ={60} className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          Hover over this card to unleash the power of CSS perspective
        </CardItem>
        <CardItem translateZ={100} rotateX={20} rotateZ={-10} className="w-full mt-4">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
            className="h-60 w-full object-cover rounded-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-6">
          <CardItem translateZ={20} className="text-sm text-neutral-800 dark:text-white">
            Try now →
          </CardItem>
          <CardItem translateZ={20} className="text-sm font-semibold bg-black text-white px-4 py-2 rounded-md">
            Sign up
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}
