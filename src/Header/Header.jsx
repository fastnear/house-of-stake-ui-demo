import { AccountNavbar } from "../SignIn/AccountNavbar.jsx";

export function Header(props) {
  return (
    <header className="sticky-top bg-white d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a
        href="/"
        className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
      >
        <span className="fs-4">HoS Testnet Demo</span>
      </a>

      <ul className="nav nav-pills d-flex">
        <li className="nav-item">
          <a className="nav-link" href="#account">
            Account
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#lockup">
            Lockup
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#venear">
            veNEAR
          </a>
        </li>

        <li className="nav-item">
          <a className="nav-link" href="#voting">
            Voting
          </a>
        </li>
        <AccountNavbar />
      </ul>
    </header>
  );
}
