"use server";
import { auth } from "@/auth";

type State = { error: string | null; redirectURL: string | null };

export const loginAction = async (
  _prevState: State,
  formData: FormData,
): Promise<State> => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "邮箱和密码是必填的", redirectURL: null };
  }
  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/",
      },
    });
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "登录失败",
      redirectURL: null,
    };
  }
  return { error: null, redirectURL: "/" };
};
