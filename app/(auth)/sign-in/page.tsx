"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { SignInTypes } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

const signInUser = async (user: SignInTypes) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Invalid email or password");
  }

  return data;
};

export default function SignIn() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors },
  } = useForm<SignInTypes>();

  const { mutate, isPending } = useMutation({
    mutationFn: signInUser,
    onError: (errors: Error) => toast.error(errors.message),
  });

  const onSubmit = (data: SignInTypes) => {
    mutate(
      {
        ...data,
      },
      {
        onSuccess: (data) => {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
          setUser(data.user);
          reset();
          toast.success(data.message);
          router.push("/overview");
        },
      },
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (formErrors: any) => {
    const firstError =
      formErrors?.email?.message || formErrors?.password?.message;

    if (firstError) {
      toast.error(firstError);
    }
  };

  return (
    <div className="flex items-center lg:p-5 bg-[#F8F4F0] min-h-screen">
      <div>
        <Image
          src={"/sidebar.svg"}
          alt="image"
          height={100}
          width={100}
          className="w-[400px] h-[700px] hidden lg:inline"
        />
      </div>

      <div className="w-[90%] lg:w-[60%] bg-white p-6 rounded-md max-w-lg  mx-auto border-none">
        <div className="my-3">
          <h1 className="font-bold mb-4">Sign In</h1>
          <p className="leading-0 mb-7">Enter your details below to sign in</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="flex flex-col gap-6">
            {/* EMAIL */}
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="johndoe@example.com"
                className="py-5"
                {...register("email", {
                  required: "email is required",
                })}
              />
            </div>

            {/* PASSWORD */}
            <div className="grid gap-2 relative">
              <Label>Password</Label>
              <button
                type="button"
                className="absolute right-3 top-8 w-5 h-5"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye className="size-6 text-gray-400" />
                ) : (
                  <EyeOff className="size-6 text-gray-400 " />
                )}
              </button>
              <Input
                type={showPassword ? "text" : "password"}
                className="py-5"
                {...register("password", {
                  required: "password is required",
                })}
              />
            </div>
          </div>

          {/* BUTTON */}
          <Button
            disabled={isPending}
            type="submit"
            className="w-full bg-gray-900 mt-3 py-5"
          >
            {isPending ? (
              <>
                <span>Logging in...</span>
                <Loader2 className="animate-spin ml-2" />
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-2 mt-4">
          <p>Don&apos;t have an account?</p>
          <Link href={"/sign-up"} className="text-gray-900 font-bold">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
