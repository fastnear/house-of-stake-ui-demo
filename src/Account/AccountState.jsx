import { useAccount } from "../hooks/useAccount.js";
import { Constants } from "../hooks/constants.js";
import { useState } from "react";
import { useNearView } from "../hooks/useNearView.js";
import { useNearAccount } from "../hooks/useNearAccount.js";
import { useNonce } from "../hooks/useNonce.js";

export function AccountState(props) {
  const accountId = useAccount();
  const nonce = useNonce();
  const [loading, setLoading] = useState(false);
  const accountBalance = useNearAccount({
    initialValue: null,
    accountId,
    extraDeps: [nonce],
    errorValue: null,
  })?.amount;
  const veNearBalance = useNearView({
    initialValue: "0",
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "ft_balance_of",
    args: { account_id: accountId },
    extraDeps: [nonce],
    errorValue: "0",
  });
  const accountInfo = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_account_info",
    args: { account_id: accountId },
    extraDeps: [nonce],
    errorValue: null,
  });
  const lockupId = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_lockup_account_id",
    args: { account_id: accountId },
    extraDeps: [nonce],
    errorValue: null,
  });
  const lockupBalance = useNearAccount({
    initialValue: null,
    accountId: lockupId,
    extraDeps: [nonce],
    errorValue: null,
  })?.amount;
  const lockupDeployed = lockupBalance !== null && lockupBalance !== undefined;
  const lockedAmount = useNearView({
    initialValue: null,
    contractId: lockupId,
    methodName: "get_venear_locked_balance",
    args: {},
    extraDeps: [nonce],
    errorValue: null,
  });
  const registrationCost = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "storage_balance_bounds",
    args: {},
    errorValue: null,
  })?.min;

  return (
    <div className="mb-3">
      <h3>Account State</h3>
      <div>
        Account ID: <code>{accountId}</code>
      </div>
      <div>
        Account Balance:{" "}
        <code>
          {accountBalance
            ? `${(parseFloat(accountBalance) / 1e24).toFixed(3)} NEAR`
            : `...`}
        </code>
      </div>
      <div>
        Lockup ID: <code>{lockupId}</code>
      </div>
      <div>
        Lockup Deployed: <code>{lockupDeployed ? "Yes" : "No"}</code>
      </div>
      {lockupDeployed && (
        <>
          <div key={"lockup-balance"}>
            Lockup Balance:{" "}
            <code>
              {lockupBalance
                ? `${(parseFloat(lockupBalance) / 1e24).toFixed(3)} NEAR`
                : `...`}
            </code>
          </div>
          <div key={"locked-amount"}>
            Locked Amount:{" "}
            <code>
              {lockedAmount
                ? `${(parseFloat(lockedAmount) / 1e24).toFixed(3)} NEAR`
                : `...`}
            </code>
          </div>
        </>
      )}
      <div>
        veNEAR Balance:{" "}
        <code>
          {veNearBalance
            ? `${(parseFloat(veNearBalance) / 1e24).toFixed(3)} veNEAR`
            : `...`}
        </code>
      </div>
      <div>
        Account Info:{" "}
        <code>
          {accountInfo ? (
            <pre>{JSON.stringify(accountInfo, null, 2)}</pre>
          ) : (
            "Not registered"
          )}
        </code>
      </div>
      {!accountInfo && (
        <div key="register">
          <button
            className="btn btn-primary"
            disabled={loading || !registrationCost}
            onClick={async () => {
              setLoading(true);
              const res = await near.sendTx({
                receiverId: Constants.VENEAR_CONTRACT_ID,
                actions: [
                  near.actions.functionCall({
                    methodName: "buy_tokens",
                    gas: $$`20 Tgas`,
                    deposit: registrationCost,
                    args: {},
                  }),
                ],
                waitUntil: "INCLUDED",
              });
              console.log("registration TX", res);
              setLoading(false);
            }}
          >
            Register Account
          </button>
        </div>
      )}
    </div>
  );
}
