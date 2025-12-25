import AppRoutes from './routes/AppRoute'
import MessageStyles from "../src/components/Message/MessageStyles";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import './App.css'
function App() {
    return (
        <>
            <MessageStyles />
            <AppRoutes />
        </>
    );
}
export default App;