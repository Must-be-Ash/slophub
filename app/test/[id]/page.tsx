export default async function TestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Route Working!</h1>
      <p>ID: {id}</p>
    </div>
  );
}
