import { useEffect, useState } from "react";
import { tryToJSON } from "./utils.js";

export function useNearAccount({
  initialValue,
  accountId,
  blockId,
  extraDeps,
  errorValue,
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (near) {
      near
        .queryAccount({
          accountId,
          blockId,
        })
        .then((result) => setValue(result.result))
        .catch(() => setValue(errorValue));
    }
  }, [accountId, blockId, ...(extraDeps ?? [])]);

  return value;
}
