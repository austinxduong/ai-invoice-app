import { BarChart2, FileText, LayoutDashboard, Mail, Sparkles, Plus, Users, Leaf, Calculator, Activity, UserCog, Undo2} from "lucide-react"

export const FEATURES = [
  {
    icon: Sparkles,
    title: "AI Invoice Creation",
    description:
    "Paste any text, email, or receipt, and our AI will generate an invoice."
  },
  {
    icon: BarChart2,
    title: "AI-Powered Dashboard",
    description:
    "Get smart reporting for actionable insights towards your business finances, generated automatically."
  },
  {
    icon: Mail,
    title: "AI Reminders",
    description:
    "Automatically generate effective payment reminders for your emails, from Accounts Receiveables."
  },
  {
    icon: FileText,
    title: "Simple Invoice Management",
    description:
    "Easily manage all your invoices, track payments, and send reminders from Accounts Payable"
  }
]

export const TESTIMONIALS = [
  {
    quote:"sample quote0",
    author:"sample author0",
    title:"sample title0",
    avatar:"https://t4.ftcdn.net/jpg/14/39/45/13/360_F_1439451345_QlgFYvVJNXUwG6hsMlfJ5YQ3dJvsKLQb.jpg",
  },
  {
    quote:"sample quote1",
    author:"sample author1",
    title:"sample title1",
    avatar:"https://t4.ftcdn.net/jpg/14/39/45/13/360_F_1439451345_QlgFYvVJNXUwG6hsMlfJ5YQ3dJvsKLQb.jpg",
  },
  {
    quote:"sample quote2",
    author:"sample author2",
    title:"sample title2",
    avatar:"https://t4.ftcdn.net/jpg/14/39/45/13/360_F_1439451345_QlgFYvVJNXUwG6hsMlfJ5YQ3dJvsKLQb.jpg",
  },
  {
    quote:"sample quote3",
    author:"sample author3",
    title:"sample title3",
    avatar:"https://t4.ftcdn.net/jpg/14/39/45/13/360_F_1439451345_QlgFYvVJNXUwG6hsMlfJ5YQ3dJvsKLQb.jpg",
  },
]

export const NAVIGATION_MENU = [
 { id: "dashboard", name: "Dashboard", icon: LayoutDashboard},
 { id: "invoices", name: "Invoices", icon: FileText },
 { id: "invoices/new", name: "Create Invoice", icon: Plus },
 { id: "products", name:"Product Catalog", icon: Leaf},
 { id: "rma", name: "RMA Returns", icon: Undo2 },
 { id: "pos", name: "Point of Sale", icon: Calculator},
 { id: "profile", name: "Profile", icon: Users },
 { id: "team", name: "Team Management", icon: UserCog},
 { id: "reports", name: "Reports", icon: Activity}
]