import { useNavigate } from "react-router-dom";
import MobileLayout from "../components/MobileLayout";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <MobileLayout title="Profile">
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
          <p className="mt-1 font-medium">{user?.name}</p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
          <p className="mt-1 font-medium">{user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-red-600 px-4 py-3 font-medium text-white"
        >
          Logout
        </button>
      </div>
    </MobileLayout>
  );
}

export default Profile;