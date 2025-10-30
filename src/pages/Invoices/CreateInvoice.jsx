import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths"
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast"
import moment from "moment"
import { useAuth } from "../../context/AuthContext"

const CreateInvoice = () => {
  return (
    <div>CreateInvoice</div>
  )
}

export default CreateInvoice