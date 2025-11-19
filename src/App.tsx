import { MainLayout } from './components/layout/MainLayout';
import { GraphProvider } from './context/GraphContext';

function App() {
  return (
    <GraphProvider>
      <MainLayout />
    </GraphProvider>
  );
}

export default App;
