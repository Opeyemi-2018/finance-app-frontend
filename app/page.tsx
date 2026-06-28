"use client";

import { redirect,  } from "next/navigation";

const Main = () => {
 redirect("/sign-in");
  return <div>Main</div>;
};

export default Main;
