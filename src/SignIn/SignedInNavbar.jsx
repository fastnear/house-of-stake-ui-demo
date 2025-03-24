import { signOut } from "@fastnear/api";

export function SignedInNavbar(props) {
  return (
    <>
      <li className="nav-item">
        <button className="btn btn-secondary" onClick={() => signOut()}>
          Sign Out
        </button>
      </li>
    </>
  );
}
