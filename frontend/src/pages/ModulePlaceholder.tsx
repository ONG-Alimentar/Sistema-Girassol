// Página genérica de placeholder por módulo. As telas reais (listagens, CRUD)
// de cada módulo entram em issues futuras — aqui só provamos que a rota e o
// guard de permissão funcionam.
export function ModulePlaceholder({ title }: { title: string }) {
  return (
    <section>
      <h1>{title}</h1>
      <p>Em construção.</p>
    </section>
  )
}
