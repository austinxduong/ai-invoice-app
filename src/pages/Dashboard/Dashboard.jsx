import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { Loader2, FileText, DollarSign, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import Button from "../../components/ui/Button"
import AIInsightsCard from "../../components/AIInsightsCard";
import { Building2, CreditCard, Users } from "lucide-react";

// NEW: Organization Info Card Component
const OrganizationInfoCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg shadow-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Organization</h3>
        <div className="flex items-center text-sm text-slate-500">
          <Building2 className="w-4 h-4 mr-1" />
          {user.role}
        </div>
      </div>

      <div className="space-y-3">
        {/* Company Name */}
        <div>
          <div className="text-xs text-slate-500 mb-1">Company Name</div>
          <div className="text-sm font-medium text-slate-900">
            {user.organizationName || 'N/A'}
          </div>
        </div>

        {/* Customer Code */}
        <div>
          <div className="text-xs text-slate-500 mb-1">Customer Code</div>
          <div className="text-sm font-mono text-slate-900 bg-slate-50 px-2 py-1 rounded">
            {user.organizationId || 'N/A'}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="flex gap-4 pt-2 border-t border-slate-200">
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-1">Plan</div>
            <div className="text-sm font-medium text-slate-900 capitalize">
              {user.subscriptionPlan || 'N/A'}
            </div>
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-500 mb-1">Status</div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              user.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' :
              user.subscriptionStatus === 'trialing' ? 'bg-blue-100 text-blue-800' :
              user.subscriptionStatus === 'past_due' ? 'bg-amber-100 text-amber-800' :
              'bg-red-100 text-red-800'
            }`}>
              {user.subscriptionStatus || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {

  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        console.log('👤 User loaded:', userData);
        console.log('🏢 Organization:', userData.organizationId);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(
          API_PATHS.INVOICE.GET_ALL_INVOICES
        );
        const invoices = response.data;
        console.log("Dashboard invoices fetched:", invoices);

        if (!Array.isArray(invoices)) {
          console.error("Expected array but got:", invoices);
          setStats({ totalInvoices: 0, totalPaid: 0, totalUnpaid: 0 });
          setRecentInvoices([]);
          return;
        }

        const totalInvoices = invoices.length;
        const totalPaid = invoices
          .filter((inv) => inv.status === "Paid")
          .reduce((acc, inv) => acc + inv.total, 0);
        const totalUnpaid = invoices
          .filter((inv) => inv.status !== "Paid")
          .reduce((acc, inv) => acc + inv.total, 0);
        
        setStats({ totalInvoices, totalPaid, totalUnpaid });
        setRecentInvoices(
          invoices.sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
          .slice(0, 5)
        );
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsData = [
    {
      icon: FileText,
      label: "Total Invoices",
      value: stats.totalInvoices,
      color: "blue",
    },
    {
      icon: DollarSign,
      label: "Total Paid",
      value: `${stats.totalPaid.toFixed(2)}`,
      color: "emerald",
    },
    {
      icon: DollarSign,
      label: "Total Unpaid",
      value: `${stats.totalUnpaid.toFixed(2)}`,
      color: "red",
    },
  ];

  const colorClasses = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600" },
    red: { bg:"bg-red-100", text: "text-red-600" },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 ">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600 mt-1">
          A quick overview of your business finances.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg shadow-gray-100"
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 w-12 h-12 ${
                  colorClasses[stat.color].bg
                } rounded-lg flex items-center justify-center`}
              >
                <stat.icon
                  className={`w-6 h-6 ${colorClasses[stat.color].text}`}
                />
              </div>
              <div className="ml-4 min-w-0">
                <div className="text-sm font-medium text-slate-500 truncate">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-slate-900 break-words">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW: Add Organization Info Card ⬇️ */}
      <OrganizationInfoCard user={user} />

      <AIInsightsCard/>

      {/* recent invoices? */}
      <div className="w-full bg-white border border-slate-200 rounded-lg shadow-sm shadow-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent Invoices
          </h3>
          <Button variant="ghost" onClick={() => navigate("/invoices")}>
            View All
          </Button>
        </div>

        {recentInvoices.length > 0 ? (
          <div className="w-[90vw] md:w-auto overflow-x-auto">
            <table className="w-full min-w-[600px] divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {recentInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {invoice.billTo.clientName}
                      </div>
                      <div className="text-sm text-slate-500">
                        #{invoice.invoiceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : invoice.status === "Pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {moment(invoice.dueDate).format("MMM D, YYYY")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No invoices yet
            </h3>
            <p className="text-slate-500 mb-6 max-w-md">
              You haven't created any invoices yet. Get started by creating your
              first one.
            </p>
            <Button onClick={() => navigate("/invoices/new")} icon={Plus}>
              Create Invoice
            </Button>
          </div>
        )}
      </div>
      
    </div>
  )
}

export default Dashboard