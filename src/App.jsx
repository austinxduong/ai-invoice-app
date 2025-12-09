import {
  BrowserRouter as Router,
  Routes,
  Route,
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
import DashboardLayout from "./components/layout/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import ProductCatalog from "./components/POS/ProductCatalog";
import { CartProvider } from "./context/CartContext";
import CartModal from "./components/cart/CartModal";
import POSSystem from "./pages/POS/POSSystem";
import { POSTransactionProvider } from "./context/POSTransaction";
import ReportsDashboard from "./pages/Reports/ReportsDashboard";
import { ReportingProvider } from "./context/ReportingContext";

const App = () => {
  console.log('🚨 APP COMPONENT LOADING');

  return (
    <AuthProvider>
      <CartProvider>
        <POSTransactionProvider>
          <ReportingProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />


            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            
            <Route path="/products" element={
              <ProtectedRoute>
                  <ProductCatalog />
              </ProtectedRoute>
            } />
            
           
            <Route path="/invoices" element={
              <ProtectedRoute>
                <AllInvoices />
              </ProtectedRoute>
            } />
            
            <Route path="/invoices/new" element={
              <ProtectedRoute>
                <CreateInvoice />
              </ProtectedRoute>
            } />
            
            <Route path="/invoices/:id" element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

          <Route path="/pos" element={
            <ProtectedRoute>
              <POSSystem />
            </ProtectedRoute>
            } />

          <Route path="/reports" element={
            <ProtectedRoute>
                  <ReportsDashboard />
            </ProtectedRoute>
          } />

          </Routes>

              <CartModal />
            </Router>
          </ReportingProvider>
        </POSTransactionProvider>

        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;






// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
// import LandingPage from "./pages/LandingPage/LandingPage";
// import SignUp from "./pages/Auth/SignUp";
// import Login from "./pages/Auth/Login";
// import Dashboard from "./pages/Dashboard/Dashboard";
// import AllInvoices from "./pages/Invoices/AllInvoices";
// import CreateInvoice from "./pages/Invoices/CreateInvoice";
// import InvoiceDetail from "./pages/Invoices/InvoiceDetail";
// import ProfilePage from "./pages/Profile/ProfilePage";
// import ProtectedRoute from "./components/auth/ProtectedRoute";
// import { AuthProvider } from "./context/AuthContext";
// import ProductCatalog from "./components/POS/ProductCatalog";
// import { CartProvider } from "./context/CartContext";
// import Header from "./components/Header";
// import CartModal from "./components/cart/CartModal";


// const App = () => {

// console.log('🚨 APP COMPONENT LOADING')


//   return (
//     <AuthProvider>
//       <CartProvider>
//         {/* <Header />  */}
        

//       <Router>
//         <CartModal />
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<SignUp />} />

      
//           {/* Protected Routes */}
//           <Route path="/invoices/new" element={<ProtectedRoute><CreateInvoice /></ProtectedRoute>} />
//           <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetail /></ProtectedRoute>} />
//           <Route path="/invoices" element={<ProtectedRoute><AllInvoices /></ProtectedRoute>} />
//           <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//           <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
//           <Route path="/products" element={<ProductCatalog onAddToCart={(product) => console.log('Add to cart')} />} />
//         

//           {/* POS Routes */}
//           <Route path="/products" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />

//         </Routes>
//       </Router>

//       <Toaster
//         toastOptions={{
//           className: "",
//           style: {
//             fontSize: "13px",
//           },
//         }}
//       />
//       </CartProvider>
//     </AuthProvider>
//   )
// }

// export default App