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
  return (
    <section className="w-sm h-screen bg-primary text-white p-4 flex flex-col justify-between">
      {/* TOP PANEL */}
      <div className="flex flex-col gap-4">
        <div className="sidebar-item">
          <UserPlusIcon />
          <label>Register</label>
        </div>

        <div className="sidebar-item">
          <CoinsIcon />
          <label>Check Balance</label>
        </div>

        <div className="sidebar-item">
          <HandCoinsIcon />
          <label>Exchange</label>
        </div>

        <div className="sidebar-item">
          <ExchangeIcon />
          <label>Transaction</label>
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div className="flex items-center bg-secondary p-2 rounded-full gap-4">
        <div className="rounded-full bg-white p-2 text-black">
          <UserIcon />
        </div>

        <div className="flex flex-col gap-1 text-xs text-center">
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
