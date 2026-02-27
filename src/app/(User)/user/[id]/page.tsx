export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {  
  const { id } = await params
  return <div>User Profile: {id}</div>
} 
