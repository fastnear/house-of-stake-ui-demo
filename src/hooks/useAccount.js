import { useEffect, useState } from "react";

export function useAccount() {
  const [accountId, setAccountId] = useState(near.accountId());

  useEffect(() => {
    near.event.onAccount(setAccountId);
  }, []);

  return accountId;
}
