import Router from "./app/router";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { TranslationProvider } from "./context/TranslationContext";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TranslationProvider>
          <Router />
        </TranslationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;