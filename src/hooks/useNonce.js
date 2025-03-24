import { useEffect, useState } from "react";

export function useNonce() {
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    near.event.onTx(() => {
      setNonce((nonce) => nonce + 1);
    });
  }, []);

  return nonce;
}
