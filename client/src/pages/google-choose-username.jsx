import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function GoogleChooseUsernamePage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // Read ?email from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (!emailParam) {
      toast({
        title: "Error",
        description: "Invalid Google signup session.",
        variant: "destructive",
      });
      navigate("/login");
    } else {
      setEmail(emailParam);
    }
  }, [navigate, toast]);

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!username.trim()) {
    toast({
      title: "Error",
      description: "Username cannot be empty",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);

  try {
    // FIX: Changed the endpoint to match the backend handler
    const res = await fetch("/api/auth/google/complete-registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username }),
    });

    const data = await res.json();

    if (!res.ok) {
        // The server is expected to send back a 400 with a message if username is taken
        const message = data.message || "Failed to complete registration. Please try again.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
    } else {
      // User is now logged in on the backend, redirect to dashboard or appropriate place
      navigate(`/`); // Assuming the root redirects based on role
    }
  } catch (err) {
    toast({
      title: "Error",
      description: "A network error occurred.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Choose Username</CardTitle>
          <CardDescription className="text-center">
            Pick a username for your new account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => navigate("/login")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}