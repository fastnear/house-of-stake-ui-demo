import { useAccount } from "../hooks/useAccount.js";
import { Constants } from "../hooks/constants.js";
import { useEffect, useState } from "react";

export function AccountState(props) {
  const accountId = useAccount();
  const [accountBalance, setAccountBalance] = useState(null);
  const [lockupId, setLockupId] = useState(null);
  const [lockupDeployed, setLockupDeployed] = useState(null);
  const [lockupBalance, setLockupBalance] = useState(null);
  const [lockedAmount, setLockedAmount] = useState(null);
  const [veNearBalance, setVeNearBalance] = useState(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (accountId) {
      near
        .view({
          contractId: Constants.VENEAR_CONTRACT_ID,
          methodName: "get_lockup_account_id",
          args: { account_id: accountId },
        })
        .then(setLockupId);

      near
        .queryAccount({
          accountId,
        })
        .then((account) => {
          setAccountBalance(account?.result?.amount);
        });
    } else {
      setLockupId(null);
    }
  }, [accountId, nonce]);

  useEffect(() => {
    if (lockupId) {
      near
        .view({
          contractId: lockupId,
          methodName: "get_balance",
          args: {},
        })
        .then((res) => {
          setLockupDeployed(true);
          setLockupBalance(res);
        })
        .catch((err) => {
          setLockupDeployed(false);
          setLockupBalance(null);
        });
    } else {
    }
  }, [lockupId, nonce]);

  return (
    <div>
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
        <div key={"lockup-balance"}>
          Lockup Balance:{" "}
          <code>
            {lockupBalance
              ? `${(parseFloat(lockupBalance) / 1e24).toFixed(3)} NEAR`
              : `...`}
          </code>
        </div>
      )}
    </div>
  );
}
