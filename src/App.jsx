import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllInvoices from "./pages/Invoices/AllInvoices";
import CreateInvoice from "./pages/Invoices/CreateInvoice";
import InvoiceDetail from "./pages/Invoices/InvoiceDetail";
import ProfilePage from "./pages/Profile/ProfilePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";


const App = () => {

console.log('🚨 APP COMPONENT LOADING')


  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          
        {/* <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/invoices" element ={
          <ProtectedRoute>
            < AllInvoices />
          </ProtectedRoute>
        } />

        <Route path="/invoices/new" element={
          <ProtectedRoute>
            <CreateInvoice />
          </ProtectedRoute>
        } />

        <Route path="invoices/:id" element={
          <ProtectedRoute>
            <InvoiceDetail />
          </ProtectedRoute>
        } />

        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  );
}; */}
         
        <Route element={<ProtectedRoute /> }>
          <Route path="/dashboard" element={
            <div>
            {console.log('🗺️ Dashboard route matched!')}
            <Dashboard />
            </div>
          } />
          <Route path="/invoices" element={
            <div>
            {console.log('🗺️ Invoices route matched!')}
            <AllInvoices />
            </div>
            } />
          <Route path="/invoices/new" element={
            <div>
            {console.log('🗺️ Create Invoice route matched!')}
              <CreateInvoice />
            </div>
            } />
          <Route path="/invoices/:id" element={
            <div>
            {console.log('🗺️ Invoice detail route matched!')}
              <InvoiceDetail />
            </div>
            } />
          <Route path="/profile" element={
            <div>
            {console.log('🗺️ Profile route matched!')}
              <ProfilePage />
            </div>
            } />
        </Route>
        </Routes>
      </Router>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  )
}

export default App