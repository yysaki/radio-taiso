import { createRoot } from 'remix/component'

function App() {
  return () => <h1>ラジオ体操</h1>
}

createRoot(document.getElementById('app')!).render(<App />)
