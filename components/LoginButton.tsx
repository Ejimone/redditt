"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

type LoginButtonProps = {
  className?: string;
  callbackUrl?: string;
  forcePrompt?: boolean;
};

export default function LoginButton({
  className,
  callbackUrl = "/",
  forcePrompt = false,
}: LoginButtonProps) {
  return (
    <Button
      className={className}
      type="button"
      onClick={() =>
        signIn(
          "github",
          { redirectTo: callbackUrl },
          forcePrompt ? { prompt: "login" } : undefined,
        )
      }
    >
      Sign in with GitHub
    </Button>
  );
}
