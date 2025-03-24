import { AccountNavbar } from "../SignIn/AccountNavbar.jsx";

export function Header(props) {
  return (
    <header className="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a
        href="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
      >
        <span className="fs-4">HoS Testnet Demo</span>
      </a>

      <ul className="nav nav-pills">
        <AccountNavbar />
      </ul>
    </header>
  );
}
