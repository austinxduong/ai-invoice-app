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
        className="flex items-center space-x-3"
    >
        {avatar ? (
            <img
                src={avatar}
                alt="Avatar"
                className=""
            />
        )   :   (
            <div className="">
                <span className="">
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