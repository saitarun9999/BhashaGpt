"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      router.push("/");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      className="h-screen flex justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg.png')" }}
    >
      <Card className="w-[800px] h-[500px] p-6 shadow-2xl bg-white bg-opacity-10 backdrop-blur-lg rounded-4xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            <div className="flex flex-col items-center w-full py-4 px-5">
              <h1 className="text-5xl font-bold text-black">BhashaGPT</h1>
              <motion.h4 className="text-xl text-black font-bold mt-2">
                Many Languages - ONE India
              </motion.h4>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-black text-lg font-bold mb-5">Username</label>
              <Input
                type="text"
                className="mt-1 p-3 text-lg rounded-lg w-full"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-black text-lg font-bold mb-5">Password</label>
              <Input
                type="password"
                className="mt-2 p-4 text-lg rounded-lg w-full"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full p-6 mt-8 text-lg font-bold tracking-[2px]">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}