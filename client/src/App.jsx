import { Routes, Route, Navigate } from 'react-router-dom';
import RoleLayout from './components/RoleLayout';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceHistory from './pages/InvoiceHistory';
import Clients from './pages/Clients';
import Reports from './pages/Reports';
import ItemsAdmin from './pages/ItemsAdmin';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireRole from './components/RequireRole';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerCreateInvoice from './pages/WorkerCreateInvoice';
import WorkerMyInvoices from './pages/WorkerMyInvoices';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirects to dashboard (which redirects to login if unauth) OR direct to login */}
      {/* User asked for localhost:3000 to be login. Let's make root render Login directly as requested, but safe. */}
      {/* If I use the Login component at '/', the useEffect above handles auth users. */}
      {/* If I use Navigate to /login, it changes URL. Let's try Navigate to /login purely for code health if the previous fix works. */}

      {/* Strategy: Root -> Login Component. If logic above is fixed, this should work. */}
      <Route path="/" element={<Login />} />

      <Route element={
        <RequireRole>
          <RoleLayout />
        </RequireRole>
      }>
        <Route
          path="dashboard"
          element={
            <RequireRole role="admin">
              <Dashboard />
            </RequireRole>
          }
        />
        <Route
          path="create-invoice"
          element={
            <RequireRole role="admin">
              <CreateInvoice />
            </RequireRole>
          }
        />
        <Route
          path="items"
          element={
            <RequireRole role="admin">
              <ItemsAdmin />
            </RequireRole>
          }
        />
        <Route
          path="invoice-history"
          element={
            <RequireRole role="admin">
              <InvoiceHistory />
            </RequireRole>
          }
        />
        <Route
          path="clients"
          element={
            <RequireRole role="admin">
              <Clients />
            </RequireRole>
          }
        />
        <Route
          path="reports"
          element={
            <RequireRole role="admin">
              <Reports />
            </RequireRole>
          }
        />

        <Route
          path="worker/dashboard"
          element={
            <RequireRole role="worker">
              <WorkerDashboard />
            </RequireRole>
          }
        />
        <Route
          path="worker/create-invoice"
          element={
            <RequireRole role="worker">
              <WorkerCreateInvoice />
            </RequireRole>
          }
        />
        <Route
          path="worker/my-invoices"
          element={
            <RequireRole role="worker">
              <WorkerMyInvoices />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
