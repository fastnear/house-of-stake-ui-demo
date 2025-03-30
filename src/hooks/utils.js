import Big from "big.js";

export function tryToJSON(value, defaultValue = null) {
  try {
    return JSON.stringify(value);
  } catch (e) {
    return defaultValue;
  }
}

export function processAccount(account) {
  const delegatedBalance = Big(account.delegated_balance.near_balance).add(
    Big(account.delegated_balance.extra_venear_balance),
  );
  const balance = Big(account.balance.near_balance).add(
    Big(account.balance.extra_venear_balance),
  );
  let totalBalance = delegatedBalance;
  if (!account.delegation) {
    totalBalance = totalBalance.add(balance);
  }
  return {
    accountId: account.account_id,
    balance,
    delegatedBalance,
    totalBalance,
    delegation: account.delegation,
  };
}
