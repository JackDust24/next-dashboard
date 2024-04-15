"use client";
import { Session } from "next-auth";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import React, {
  DetailedHTMLProps,
  FormEvent,
  FormHTMLAttributes,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Login = () => {
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
    const password = e.target[1].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      if (res?.url) router.replace("/dashboard");
    } else {
      setError("");
    }
  };

  if (sessionStatus === "loading") {
    return <h1>Loading...</h1>;
  }

  // return session ? (
  //   <SignoutSession session={session} />
  // ) : (
  //   <LoginSession />
  // );

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
      <div className="bg-[#212121] p-8 rounded shadow-md w-96">
        <h1 className="text-4xl text-center font-semibold mb-8">Login</h1>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            className="w-full border border-gray-300 text-sm text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
            placeholder="Email"
            required
          />
          <input
            type="password"
            className="w-full border border-gray-300 text-sm text-black rounded px-3 py-2 mb-4 focus:outline-none focus:border-blue-400 focus:text-black"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white text-xl py-2 rounded hover:bg-blue-600"
          >
            {" "}
            Sign In
          </button>
          <p className="text-red-600 text-[16px] mb-4">{error && error}</p>
        </form>
        <div className="flex flex-col items-center mt-6">
          <button
            className="w-full bg-sky-500 py-2 px-6 rounded-md mb-2 text-lg"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
          <button
            className="w-full bg-sky-500 py-2 px-6 rounded-md mb-2 text-lg"
            onClick={() => signIn("github")}
          >
            Sign in with Github
          </button>
        </div>

        <div className="text-center mt-2 text-[20px] text-sky-50">- OR -</div>
        <Link
          className="block text-center text-blue-500 hover:underline mt-2"
          href="/register"
        >
          Register Here
        </Link>
      </div>
    </div>
  );
}

//TODO: Remove this
function SignoutSession({ session }: { session: Session }) {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <div className="w-44 h-44 relative mb-4">
        <p className="text-2xl mb-2">
          Welcome <span className="font-bold">{session.user?.name}</span>.
          Signed In As
        </p>
        <p className="font-bold mb-4">{session.user?.email}</p>
        <button
          className="bg-red-600 py-2 px-6 rounded-md"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
      <div>
        <Image
          src={session.user?.image as string}
          fill
          alt=""
          className="object-cover rounded-full"
        />
      </div>
    </div>
  );
}

export default Login;
