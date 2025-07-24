export default function VisitPage({ params }: { params: { id: string } }) {
  return <div>Bem-vindo ao evento como voluntário! ID: {params.id}</div>;
}
