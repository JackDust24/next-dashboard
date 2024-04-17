"use client";
import { Session } from "next-auth";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import sgMail from "@sendgrid/mail";

const ForgetPassword = () => {
  const [error, setError] = useState("");
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      return;
    }

    try {
      const res = await fetch("/api/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });
      if (res.status === 400) {
        setError("User with this email is not registered");
      }
      if (res.status === 200) {
        setError("");
        router.push("/login");
      }
    } catch (error) {
      setError("Error, try again");
      console.log(error);
    }
  };

  if (sessionStatus === "loading") {
    return <h1>Loading...</h1>;
  }

  return (
    sessionStatus !== "authenticated" && (
      <LoginSession onSubmit={handleSubmit} error={error} />
    )
  );
};

function LoginSession({
  onSubmit,
  error,
}: {
  onSubmit: (event: any) => void;
  error: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24 text-white">
      <div className="bg-[#313131] p-8 rounded shadow-md w-96">
        <h1 className="text-4xl text-center font-semibold mb-8">
          Forgot Password
        </h1>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="w-full border border-gray-300 text-sm text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
            placeholder="Email"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white text-xl py-2 rounded hover:bg-blue-600"
          >
            {" "}
            Submit
          </button>
          <p className="text-red-600 text-[16px] mb-4">{error && error}</p>
        </form>
        <div className="text-center text-gray-500 mt-4">- OR -</div>
        <Link
          className="block text-center text-blue-500 hover:underline mt-2"
          href="/login"
        >
          Login Here
        </Link>
      </div>
    </div>
  );
}

export default ForgetPassword;
