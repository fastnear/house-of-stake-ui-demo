import { useEffect, useState } from "react";
import { useNearView } from "../hooks/useNearView.js";
import { Constants } from "../hooks/constants.js";
import { useNonce } from "../hooks/useNonce.js";
import { processAccount, toVeNear } from "../hooks/utils.js";

function processAccounts(accounts) {
  return accounts
    .map((accountInfo) => processAccount(accountInfo.account))
    .toSorted((a, b) => b.totalBalance.cmp(a.totalBalance));
}

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
  const [accounts, setAccounts] = useState(null);
  useEffect(() => {
    if (numAccounts === null || numAccounts === "err") {
      setAccounts(null);
      return;
    }
    const promises = [];
    for (let i = 0; i < numAccounts; i += Constants.NUM_ACCOUNTS_PER_QUERY) {
      promises.push(
        near.view({
          contractId: Constants.VENEAR_CONTRACT_ID,
          methodName: "get_accounts",
          args: { from_index: i, limit: Constants.NUM_ACCOUNTS_PER_QUERY },
        }),
      );
    }
    Promise.all(promises)
      .then((results) => {
        setAccounts(processAccounts(results.flat()));
      })
      .catch(() => {
        setAccounts(null);
      });
  }, [numAccounts, nonce]);
  return (
    <div className="mb-5">
      <h3 id="venear">veNEAR Contract State</h3>
      <div>
        Contract ID: <code>{Constants.VENEAR_CONTRACT_ID}</code>
      </div>
      <div>
        Total Supply: <code>{toVeNear(totalSupply)}</code>
      </div>
      <div>
        Total number of Accounts:{" "}
        <code>{numAccounts !== null ? numAccounts : `...`}</code>
      </div>
      {accounts ? (
        <div key="accounts">
          Top 10 Accounts:
          <div>
            {accounts.slice(0, 10).map((account, i) => (
              <div key={i}>
                <code>
                  {account.accountId}: {toVeNear(account.totalBalance)}
                </code>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
