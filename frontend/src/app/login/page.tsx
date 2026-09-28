import LoginForm from "../../../components/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-slate-950" />}><LoginForm /></Suspense>;
}
