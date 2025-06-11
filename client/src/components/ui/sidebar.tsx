import { useNavigate } from "react-router-dom";
import {
  CoinsIcon,
  ExchangeIcon,
  HandCoinsIcon,
  LogoutIcon,
  MenuIcon,
  UserIcon,
  UserPlusIcon,
} from "../icons/icons";

export const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <section className="w-full max-w-[24rem] bg-primary text-white p-4 flex flex-col justify-between">
      {/* TOP PANEL */}
      <div className="flex flex-col gap-4">
        <div
          className="sidebar-item"
          onClick={() => navigate("/admin/dashboard/register")}
        >
          <UserPlusIcon />
          <label>Register</label>
        </div>

        <div
          className="sidebar-item"
          onClick={() => navigate("/admin/dashboard/check-balance")}
        >
          <CoinsIcon />
          <label>Check Account</label>
        </div>

        {/* <div className="sidebar-item">
          <HandCoinsIcon />
          <label>Exchange</label>
        </div> */}

        <div
          className="sidebar-item"
          onClick={() => navigate("/admin/dashboard/transactions")}
        >
          <ExchangeIcon />
          <label>Transaction</label>
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div className="flex items-center bg-secondary p-2 rounded-full gap-4">
        <div className="rounded-full bg-white p-2 text-black">
          <UserIcon />
        </div>

        <div className="flex flex-col gap-1 flex-1 text-xs text-center">
          <label>Operator Name</label>
          <label>ADMIN / EMPLOYEE</label>
        </div>

        <div className="rounded-full bg-white p-2 text-black ml-auto">
          <MenuIcon />
        </div>
      </div>
    </section>
  );
};

export default Sidebar;
