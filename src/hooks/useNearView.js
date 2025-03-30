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

    setValue(initialValue);

    let alive = true;

    near
      .view({
        contractId,
        methodName,
        args,
        argsBase64,
        blockId,
      })
      .then((v) => {
        if (alive) {
          setValue(v);
        }
      })
      .catch((e) => {
        if (alive) {
          setValue(errorValue);
        }
      });
    return () => {
      alive = false;
    };
  }, [contractId, methodName, serializedArgs, blockId, ...(extraDeps ?? [])]);

  return value;
}
