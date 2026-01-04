export default async function AdminProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <div>Admin Profile: {id}</div>
}