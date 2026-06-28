/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignUpTypes } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const registerUser = async (user: SignUpTypes) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "cannot sign in user");
  return data;
};

export default function SignUp() {
  const router = useRouter();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpTypes>();
  const { data, mutate, isPending } = useMutation({ mutationFn: registerUser });

  const onsubmit = (data: SignUpTypes) => {
    mutate(
      {
        ...data,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          reset();
          router.push("/sign-in");
        },
      },
    );
  };

  const onError = (formErrors: any) => {
    const firstError =
      formErrors.username?.message || formErrors.password?.message;

    if (firstError) {
      toast.error(firstError);
    }
  };
  return (
    <div className="flex items-center lg:p-5 bg-[#F8F4F0] min-h-screen">
      <div>
        <Image
          src={"/Sidebar.svg"}
          alt="image"
          height={100}
          width={100}
          className="w-[400px] h-[700px] hidden lg:inline"
        />
      </div>
      <div className="w-[90%] lg:w-[60%] bg-white p-6 rounded-md max-w-lg  mx-auto border-none">
        <div className="my-3">
          <h1 className="font-bold mb-4">Sign Up</h1>
          <p className="leading-0 mb-7">
            Enter your details below to sign up an account
          </p>
        </div>

        <form onSubmit={handleSubmit(onsubmit, onError)}>
          <div className="flex flex-col gap-6 my-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Name</Label>
              <Input
                id="userName"
                type="text"
                placeholder="john doe"
                className="py-5"
                {...register("userName", {
                  required: "user name is required",
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="johndoe@gmail.com"
                required
                className="py-5"
                {...register("email", {
                  required: "email is required",
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              type="password"
              required
              className="py-5"
              {...register("password", {
                required: "password is required",
              })}
            />
          </div>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-gray-900 mt-3 py-5"
          >
            {isPending ? (
              <>
                <p>Signing Up</p>...
                <Loader2 className="animate-spin" />
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-4">
          <p>Already have an account ?</p>
          <Link href={"/sign-in"} className="text-gray-900 font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
