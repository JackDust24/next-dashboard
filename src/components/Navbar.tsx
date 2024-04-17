"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { data: session }: any = useSession();
  return (
    <div>
      <ul className="flex w-full justify-between p-4 items-center bg-[#40b42b] text-[#143E14]">
        <div>
          <Link href="/">
            <li>Home</li>
          </Link>
        </div>
        <div className="flex gap-10 items-center">
          <Link href="/dashboard">
            <li>Dashboard</li>
          </Link>
          {!session ? (
            <>
              <Link href="/login">
                <li>Login</li>
              </Link>
              <Link href="/register">
                <li>Register</li>
              </Link>
            </>
          ) : (
            <>
              {session.user?.name}
              <li>
                <button
                  onClick={() => {
                    signOut();
                  }}
                  className="p-2 px-5 bg-[#143E14] rounded-full text-white"
                >
                  Logout
                </button>
              </li>
              <div className="items-center">
                <Image
                  className="border-4 border-black dark:border-slate-500 drop-shadow-xl shadow-black rounded-full mx-auto"
                  src={session.user?.image as string}
                  width={48}
                  height={48}
                  alt=""
                />
              </div>
            </>
          )}
        </div>
      </ul>
    </div>
  );
};

export default Navbar;
