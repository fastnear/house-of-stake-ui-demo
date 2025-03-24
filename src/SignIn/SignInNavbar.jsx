import { requestSignIn } from "@fastnear/api";
import { Constants } from "../hooks/constants.js";

export function SignInNavbar(props) {
  return (
    <>
      <li className="nav-item">
        <button
          className="btn btn-primary"
          onClick={() =>
            requestSignIn({ contractId: Constants.VENEAR_CONTRACT_ID })
          }
        >
          Sign In
        </button>
      </li>
    </>
  );
}
