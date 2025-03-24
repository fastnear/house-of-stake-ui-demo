import { useEffect, useState } from "react";
import { tryToJSON } from "./utils.js";

export function useNearView({
  initialValue,
  condition,
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
    if (
      condition &&
      !condition({
        contractId,
        methodName,
        args,
        argsBase64,
        blockId,
        extraDeps,
      })
    ) {
      setValue(errorValue);
      return;
    }

    near
      .view({
        contractId,
        methodName,
        args,
        argsBase64,
        blockId,
      })
      .then(setValue, (e) => setValue(errorValue));
  }, [contractId, methodName, serializedArgs, blockId, ...(extraDeps ?? [])]);

  return value;
}
