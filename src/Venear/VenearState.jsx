import { useAccount } from "../hooks/useAccount.js";
import { useState } from "react";
import { useNearAccount } from "../hooks/useNearAccount.js";
import { useNearView } from "../hooks/useNearView.js";
import { Constants } from "../hooks/constants.js";
import { useNonce } from "../hooks/useNonce.js";

export function VenearState(props) {
  const [loading, setLoading] = useState(false);
  const nonce = useNonce();
  const totalSupply = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "ft_total_supply",
    args: {},
    extraDeps: [nonce],
    errorValue: "0",
  });
  const numAccounts = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_num_accounts",
    args: {},
    extraDeps: [nonce],
    errorValue: "err",
  });
  return (
    <div className="mb-3">
      <h3>veNEAR Contract State</h3>
      <div>
        Contract ID: <code>{Constants.VENEAR_CONTRACT_ID}</code>
      </div>
      <div>
        Total Supply:{" "}
        <code>
          {totalSupply
            ? `${(parseFloat(totalSupply) / 1e24).toFixed(3)} veNEAR`
            : `...`}
        </code>
      </div>
      <div>
        Total number of Accounts:{" "}
        <code>{numAccounts !== null ? numAccounts : `...`}</code>
      </div>
    </div>
  );
}
