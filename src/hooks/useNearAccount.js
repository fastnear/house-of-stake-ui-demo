import { useEffect, useState } from "react";

export function useNearAccount({
  initialValue,
  condition,
  accountId,
  blockId,
  extraDeps,
  errorValue,
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (
      condition &&
      !condition({
        accountId,
        blockId,
        extraDeps,
      })
    ) {
      setValue(errorValue);
      return;
    }

    near
      .queryAccount({
        accountId,
        blockId,
      })
      .then((result) => setValue(result.result))
      .catch((e) => setValue(errorValue));
  }, [accountId, blockId, ...(extraDeps ?? [])]);

  return value;
}
