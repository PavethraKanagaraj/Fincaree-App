import { redirect } from "next/navigation";

/* ============================================================
   Root page — redirect to Home
   ============================================================ */
export default function RootPage() {
  redirect("/home");
}
