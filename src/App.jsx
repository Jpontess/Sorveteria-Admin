// src/App.jsx
import { AppRoutes } from './routes/appRoutes';
// (Importe seu Navbar/Footer aqui se eles forem globais)

export function App() {
  return (
    <div>
      {/* <Navbar /> */}
      <main>
        {/* O AppRoutes vai renderizar a página correta aqui */}
        <AppRoutes />
      </main>
      {/* <Footer /> */}
    </div>
  );
}
