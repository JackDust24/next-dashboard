"use client";
import { Session } from "next-auth";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import sgMail from "@sendgrid/mail";

const ResetPassword = ({ params }: any) => {
  const [error, setError] = useState("");
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch("/api/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: params.token,
          }),
        });
        if (res.status === 400) {
          setError("Invalid token or has expired");
          setVerified(true);
        }
        if (res.status === 200) {
          setError("");
          setVerified(true);

          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        setError("Error, try again");
        console.log(error);
      }
    };
    verifyToken();
  }, [params.token]);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const password = e.target[0].value;
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          email: user?.email,
        }),
      });
      if (res.status === 400) {
        setError("Invalid password");
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

  if (sessionStatus === "loading" || !verified) {
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
          Reset Password
        </h1>
        <form onSubmit={onSubmit}>
          <input
            type="password"
            className="w-full border border-gray-300 text-sm text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={error.length > 0}
            className="w-full bg-blue-500 text-white text-xl py-2 rounded hover:bg-blue-600"
          >
            {" "}
            Reset Password
          </button>
          <p className="text-red-600 text-[16px] mb-4">{error && error}</p>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
