import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserForm } from "@/components/users/user-form";
import { notFound } from "next/navigation";

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: params.id },
  });

  if (!user) notFound();

  const safeUser = { ...user, password: undefined };

  return <UserForm user={safeUser as any} mode="edit" />;
}
