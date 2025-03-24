import { useEffect, useState } from "react";
import { singletonHook } from "react-singleton-hook";

function useAccountInner() {
  const [accountId, setAccountId] = useState(near.accountId());

  useEffect(() => {
    near.event.onAccount(setAccountId);
  }, []);

  return accountId;
}

export const useAccount = singletonHook(near.accountId(), useAccountInner);
