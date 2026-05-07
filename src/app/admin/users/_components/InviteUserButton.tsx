"use client";

/**
 * Invite user button that navigates to the invite page
 */

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default function InviteUserButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/admin/users/invite")}
      className="gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/30 transition-all duration-200 font-medium"
    >
      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-white/20 backdrop-blur-sm">
        <UserPlus className="h-4 w-4" />
      </span>
      <span>Mời người dùng</span>
    </Button>
  );
}
