import { redirect } from "next/navigation";

export default function UpdateMemberRedirect({ params }: { params: { id: string } }) {
  const { id } = params;
  redirect(`/dashboard/admin/updateMember/${id}`);
}
