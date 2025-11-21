import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function SetPasswordPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    const usernameParam = params.get("username");

    if (!emailParam || !usernameParam) {
      toast({
        title: "Invalid Link",
        description: "Missing signup information",
        variant: "destructive",
      });
      navigate("/login");
    } else {
      setEmail(emailParam);
      setUsername(usernameParam);
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/google/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      toast({ title: "Success!", description: "Account created successfully." });
      navigate("/dashboard");
    } else {
      toast({ title: "Error", description: data.message || "Failed", variant: "destructive" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Set Your Password</CardTitle>
          <CardDescription className="text-center">
            Create your account password
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
            <Input
              type="password"
              placeholder="Confirm Password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button disabled={loading} className="w-full" type="submit">
              {loading ? "Saving..." : "Set Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
