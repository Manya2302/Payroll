import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function EnterPasswordPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (!emailParam) {
      toast({
        title: "Invalid Link",
        description: "Missing login information",
        variant: "destructive",
      });
      navigate("/login");
    } else {
      setEmail(emailParam);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const res = await fetch("/api/auth/google/enter-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      toast({ title: "Logged In", description: "Welcome back!" });
      navigate("/dashboard");
    } else {
      toast({ title: "Error", description: data.message, variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Enter Password</CardTitle>
          <CardDescription className="text-center">
            Enter your password to login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button disabled={loading} className="w-full" type="submit">
              {loading ? "Signing In..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
