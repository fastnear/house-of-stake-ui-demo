import { useEffect, useState } from "react";
import { useNearView } from "../hooks/useNearView.js";
import { Constants } from "../hooks/constants.js";
import { useNonce } from "../hooks/useNonce.js";
import Big from "big.js";

function processAccounts(accounts) {
  return accounts
    .map((account) => {
      const delegatedBalance = Big(
        account.account.delegated_balance.near_balance,
      ).add(Big(account.account.delegated_balance.extra_venear_balance));
      const balance = Big(account.account.balance.near_balance).add(
        Big(account.account.balance.extra_venear_balance),
      );
      let totalBalance = delegatedBalance;
      if (!account.account.delegation) {
        totalBalance = totalBalance.add(balance);
      }
      return {
        accountId: account.account.account_id,
        balance,
        delegatedBalance,
        totalBalance,
        delegation: account.account.delegation,
      };
    })
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
      {accounts ? (
        <div key="accounts">
          Top 10 Accounts:
          <div>
            {accounts.slice(0, 10).map((account, i) => (
              <div key={i}>
                <code>
                  {account.accountId}:{" "}
                  {account.totalBalance.div(1e24).toFixed(3)} veNEAR
                </code>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
