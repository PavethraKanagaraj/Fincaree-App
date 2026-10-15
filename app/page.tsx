import { redirect } from "next/navigation";

export default function RootPage() {
  redirect(process.env.APP_TYPE === "b2c" ? "/customer-home" : "/home");
}
