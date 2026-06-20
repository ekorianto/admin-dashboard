import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { UserForm } from "@/components/users/user-form";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <UserForm mode="create" />;
}
