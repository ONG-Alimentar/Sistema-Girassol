const apiUrl = import.meta.env.VITE_API_URL ?? '(VITE_API_URL não definida)'

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Hello World</h1>
      <p>Sistema Girassol — frontend</p>
      <p>
        API: <code>{apiUrl}</code>
      </p>
    </main>
  )
}

export default App
