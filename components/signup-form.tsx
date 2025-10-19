"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await authClient.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          image: formData.image || undefined,
          callbackURL: "/",
        },
        {
          onRequest: (ctx) => {
            // Show loading state is already handled by isLoading state
          },
          onSuccess: (ctx) => {
            // Redirect to dashboard or sign in page
            router.push("/");
          },
          onError: (ctx) => {
            // Display the error message
            setError(ctx.error.message);
            setIsLoading(false);
          },
        },
      );

      if (error) {
        setError(
          error.message ?? "An unexpected error occurred. Please try again.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>注册出错</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">姓名</Label>
        <Input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="请输入姓名"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="请输入邮箱"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          placeholder="请输入密码（至少8位）"
          minLength={8}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">头像链接（可选）</Label>
        <Input
          id="image"
          type="url"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          placeholder="请输入头像图片链接"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "注册中…" : "注册"}
      </Button>
    </form>
  );
}
