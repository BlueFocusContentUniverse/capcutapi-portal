"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/login/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = {
  error: string | null;
};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    loginAction,
    { error: null },
  );

  return (
    <form action={formAction} className="space-y-4" autoComplete="off">
      {state?.error ? (
        <Alert variant="destructive">
          <AlertTitle>登录出错</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input
          id="email"
          type="text"
          name="email"
          required
          placeholder="请输入邮箱"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="请输入密码"
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "登录中…" : "登录"}
      </Button>
    </form>
  );
}
