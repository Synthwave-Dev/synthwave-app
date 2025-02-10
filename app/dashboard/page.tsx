"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/navigation";

// Define the UserProfile interface
interface UserProfile {
  id: string;
  name: string;
  balance: number;
  created_at: string;
}

export default function Dashboard() {
  // Use the interface instead of any
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Check if the user is logged in and fetch their session
  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        fetchProfile();
      }
    }
    checkSession();
  }, [router]);

  // Fetch the user profile from Supabase
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!error) {
        setProfile(data);
      }
    }
  };

  // Handle crypto transfer request
  const handleTransfer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: profile?.id,
          type: "transfer",
          amount: parseFloat(transferAmount),
        },
      ]);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Transfer request submitted. Await manual processing.");
      setTransferAmount("");
    }
  };

  // Handle crypto sale request
  const handleSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: profile?.id,
          type: "sale",
          amount: parseFloat(saleAmount),
        },
      ]);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Sale request submitted. Await manual processing.");
      setSaleAmount("");
    }
  };

  // Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Password Reset function
  const handleResetPassword = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Password reset email sent.");
      }
    } else {
      setMessage("Unable to retrieve user email.");
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Synthwave Dashboard</h1>
        <div className="space-x-2">
          <button
            onClick={handleResetPassword}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Reset Password
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl">Hello, {profile.name}!</h2>
        <p className="mt-2">
          Your current crypto balance:{" "}
          <span className="font-bold">{profile.balance}</span>
        </p>
      </section>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <section className="grid md:grid-cols-2 gap-8">
        <form onSubmit={handleTransfer} className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Transfer Crypto</h3>
          <input
            type="number"
            step="any"
            placeholder="Amount"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="border p-2 mb-4 w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white py-2 w-full rounded">
            Request Transfer
          </button>
        </form>

        <form onSubmit={handleSale} className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Sell Crypto</h3>
          <input
            type="number"
            step="any"
            placeholder="Amount"
            value={saleAmount}
            onChange={(e) => setSaleAmount(e.target.value)}
            className="border p-2 mb-4 w-full"
            required
          />
          <button type="submit" className="bg-green-500 text-white py-2 w-full rounded">
            Request Sale
          </button>
        </form>
      </section>
    </div>
  );
}
