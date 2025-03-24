import { useEffect, useState } from "react";
import { tryToJSON } from "./utils.js";

export function useNearView({
  initialValue,
  contractId,
  methodName,
  args,
  argsBase64,
  blockId,
  extraDeps,
  errorValue,
}) {
  const [value, setValue] = useState(initialValue);

  const serializedArgs = argsBase64 ?? tryToJSON(args);

  useEffect(() => {
    if (near) {
      near
        .view({
          contractId,
          methodName,
          args,
          argsBase64,
          blockId,
        })
        .then(setValue)
        .catch((e) => setValue(errorValue));
    }
  }, [contractId, methodName, serializedArgs, blockId, ...(extraDeps ?? [])]);

  return value;
}
