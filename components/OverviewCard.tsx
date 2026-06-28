import React from "react";

interface CardProp {
  title: string;
  amount: string | number;
  bg: string;
  color: string;
}
const OverviewCard = ({ title, amount, bg, color }: CardProp) => {
  return (
    <div
      className="p-5 rounded-lg   w-full flex flex-col gap-3"
      style={{ backgroundColor: bg, color }}
    >
      <h1>{title}</h1>
      <h1 className="font-bold">{amount}</h1>
    </div>
  );
};

export default OverviewCard;
