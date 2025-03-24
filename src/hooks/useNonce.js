import { useEffect, useState } from "react";
import { singletonHook } from "react-singleton-hook";

function useNonceInner() {
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    near.event.onTx((txStatus) => {
      console.log(txStatus);
      if (txStatus.status === "Executed") {
        setNonce((nonce) => nonce + 1);
      }
    });
  }, []);

  return nonce;
}

export const useNonce = singletonHook(0, useNonceInner);
