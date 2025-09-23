"use server";
import { signIn } from "@/auth";

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
  let redirectURL;
  try {
    redirectURL = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: "/",
    });
  } catch (error) {
    return { error: "登录失败，请稍后再试", redirectURL: null };
  }
  console.log("Redirect URL:", redirectURL);
  return { error: null, redirectURL };
};
