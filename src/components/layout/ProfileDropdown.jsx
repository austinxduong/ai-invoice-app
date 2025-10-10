import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({
    isOpen,
    onToggle,
    avatar,
    companyName,
    email,
    onLogout
}) => {
    
    const navigate = useNavigate()

  return <div className="relative">
    <button
        onClick={onToggle}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
    >
        {avatar ? (
            <img
                src={avatar}
                alt="Avatar"
                className="h-9 w-9 object-cover rounded-xl"
            />
        )   :   (
            <div className="h-8 w-8 bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl flex items-center justify-center">
                <span className="text-white font-semi">
                    {companyName.charAt(0).toUpperCase()}
                </span>
            </div>
        )}
        <div className="">
            <p className="">{companyName}</p>
            <p className="">{email}</p>
        </div>
        <ChevronDown className="" />
        </button>

        {isOpen && (
            <div className="">
                <div className="">
                    <p className="">{companyName}</p>
                    <p className="">{email}</p>
                </div>

                <a 
                    onClick={() => navigate('/profile')}
                    className=""
                >
                    View Profile
                </a>
                <div className="">
                    <a
                        href="#"
                        onClick={onLogout}
                        className=""
                    >
                        Sign out
                    </a>
                </div>
            </div>
        )}
    </div>


};

export default ProfileDropdown;