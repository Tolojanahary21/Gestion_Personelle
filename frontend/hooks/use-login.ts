"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getCurrentUser,login } from "../lib/auth";

import { useAuthStore } from "../store/auth-store";

export function useLogin() {
  const router = useRouter();

  const setTokens = useAuthStore(
    (state) => state.setTokens
  );

  const setUser = useAuthStore(
    (state) => state.setUser
  );

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const tokens = await login(
        username,
        password
      );

      const user = await getCurrentUser(
        tokens.access_token
      );

      return {
        tokens,
        user,
      };
    },

    onSuccess: ({ tokens, user }) => {
      setTokens(
        tokens.access_token,
        tokens.refresh_token
      );

      setUser(user);

      switch (user.role) {
        case "Admin":
          router.push("/admin");
          break;

        case "RH":
          router.push("/hr");
          break;

        case "Manager":
          router.push("/manager");
          break;

        case "Staff":
          router.push("/staff");
          break;

        default:
          router.push("/login");
      }
    },
  });
}