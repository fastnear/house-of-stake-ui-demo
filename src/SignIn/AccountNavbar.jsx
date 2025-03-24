import { useAccount } from "../hooks/useAccount.js";
import { SignInNavbar } from "./SignInNavbar.jsx";
import { SignedInNavbar } from "./SignedInNavbar.jsx";

export function AccountNavbar(props) {
  const accountId = useAccount();

  return accountId ? (
    <SignedInNavbar accountId={accountId} props={{ ...props }} />
  ) : (
    <SignInNavbar props={{ ...props }} />
  );
}
