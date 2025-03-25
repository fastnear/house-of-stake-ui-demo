import { useAccount } from "../hooks/useAccount.js";
import { Constants } from "../hooks/constants.js";
import { useState } from "react";
import { useNearView } from "../hooks/useNearView.js";
import { useNearAccount } from "../hooks/useNearAccount.js";
import { useNonce } from "../hooks/useNonce.js";
import Big from "big.js";

const toNear = (amount) =>
  amount ? `${(parseFloat(amount) / 1e24).toFixed(3)} NEAR` : `...`;

export function AccountState(props) {
  const accountId = useAccount();
  const nonce = useNonce();
  const [loading, setLoading] = useState(false);
  const [selectStakingPool, setSelectStakingPool] = useState(
    "chorusone.pool.f863973.m0",
  );
  const accountBalance = useNearAccount({
    initialValue: null,
    condition: ({ accountId }) => !!accountId,
    accountId,
    extraDeps: [nonce],
    errorValue: null,
  })?.amount;
  const veNearBalance = useNearView({
    initialValue: "0",
    condition: ({ extraDeps }) => !!extraDeps[1],
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "ft_balance_of",
    args: { account_id: accountId },
    extraDeps: [nonce, accountId],
    errorValue: "0",
  });
  const accountInfo = useNearView({
    initialValue: undefined,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_account_info",
    args: { account_id: accountId },
    extraDeps: [nonce],
    errorValue: null,
  });
  const accountInfoReady = accountInfo !== undefined;
  let isLockupDeployed = !!accountInfo?.internal?.lockup_version;
  const lockupId = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_lockup_account_id",
    args: { account_id: accountId },
    extraDeps: [nonce, accountId],
    errorValue: null,
  });
  const lockupBalance = useNearAccount({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    accountId: lockupId,
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  })?.amount;
  const lockupInfoReady = accountInfo && lockupId && lockupBalance !== null;
  isLockupDeployed =
    isLockupDeployed && lockupBalance !== null && lockupBalance !== undefined;
  const lockedAmount = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_venear_locked_balance",
    args: {},
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  });
  const lockupLiquidAmount = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_venear_liquid_balance",
    args: {},
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  });
  const registrationCost = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "storage_balance_bounds",
    args: {},
    errorValue: null,
  })?.min;
  const lockupCost = useNearView({
    initialValue: null,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_lockup_deployment_cost",
    args: {},
    errorValue: null,
  });
  const stakingPool = useNearView({
    initialValue: null,
    contractId: lockupId,
    methodName: "get_staking_pool_account_id",
    args: {},
    errorValue: null,
  });
  const knownDepositedBalance = useNearView({
    initialValue: null,
    contractId: lockupId,
    methodName: "get_known_deposited_balance",
    args: {},
    errorValue: null,
  });

  return (
    <div className="mb-3">
      <h3 id="account">Account State</h3>
      <div>
        Account ID: <code>{accountId}</code>
      </div>
      <div>
        Account Balance: <code>{toNear(accountBalance)}</code>
      </div>
      <div>
        veNEAR Balance: <code>{toNear(veNearBalance)}</code>
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
      {accountInfoReady && !accountInfo && (
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
                    methodName: "storage_deposit",
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
      <h3 id="lockup">Lockup State</h3>
      <div>
        Lockup ID: <code>{lockupId}</code>
      </div>
      {lockupInfoReady &&
        (isLockupDeployed ? (
          <div key="lockup">
            <div key={"lockup-balance"}>
              Lockup Balance: <code>{toNear(lockupBalance)}</code>
            </div>
            <div key={"locked-amount"}>
              Locked: <code>{toNear(lockedAmount)}</code>
            </div>
            {stakingPool && (
              <div key={"staking-pool"}>
                Selected Staking Pool: <code>{stakingPool}</code>
                {Big(knownDepositedBalance).lt(0) && (
                  <div key={"known-deposited-balance"}>
                    Known Deposited Balance:{" "}
                    <code>{toNear(knownDepositedBalance)}</code>
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                className="btn btn-primary"
                disabled={
                  loading ||
                  !lockupId ||
                  !lockupLiquidAmount ||
                  Big(lockupLiquidAmount).lt(Big(10).pow(21))
                }
                onClick={async () => {
                  setLoading(true);
                  const res = await near.sendTx({
                    receiverId: lockupId,
                    actions: [
                      near.actions.functionCall({
                        methodName: "lock_near",
                        gas: $$`100 Tgas`,
                        deposit: "1",
                        args: {},
                      }),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("lock all TX", res);
                  setLoading(false);
                }}
              >
                Lock {toNear(lockupLiquidAmount)}
              </button>

              <button
                className="btn btn-secondary ms-2"
                disabled={
                  loading ||
                  !lockupId ||
                  !lockupLiquidAmount ||
                  Big(lockupLiquidAmount).lt(Big(10).pow(21))
                }
                onClick={async () => {
                  setLoading(true);
                  const res = await near.sendTx({
                    receiverId: lockupId,
                    actions: [
                      near.actions.functionCall({
                        methodName: "transfer",
                        gas: $$`100 Tgas`,
                        args: {
                          amount: lockupLiquidAmount,
                          receiver_id: accountId,
                        },
                      }),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("lock all TX", res);
                  setLoading(false);
                }}
              >
                Transfer to owner {toNear(lockupLiquidAmount)}
              </button>

              <div className={"mt-2"}>
                Select Staking Pool:
                <input
                  type={"textbox"}
                  value={selectStakingPool}
                  onChange={(e) => setSelectStakingPool(e.target.value)}
                />
                <button
                  className="btn btn-secondary ms-2"
                  disabled={loading || !lockupId}
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "select_staking_pool",
                          gas: $$`100 Tgas`,
                          args: { staking_pool_account_id: selectStakingPool },
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("lock all TX", res);
                    setLoading(false);
                  }}
                >
                  Select Staking Pool
                </button>
              </div>

              <div className={"mt-2"}>
                <button
                  className="btn btn-primary"
                  disabled={
                    loading ||
                    !lockupId ||
                    !selectStakingPool ||
                    !lockupLiquidAmount ||
                    Big(lockupLiquidAmount).lt(Big(10).pow(21))
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "deposit_and_stake",
                          gas: $$`200 Tgas`,
                          args: { amount: lockupLiquidAmount },
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("lock all TX", res);
                    setLoading(false);
                  }}
                >
                  Stake {toNear(lockupLiquidAmount)}
                </button>

                <button
                  className="btn btn-primary ms-2"
                  disabled={
                    loading ||
                    !lockupId ||
                    knownDepositedBalance ||
                    !selectStakingPool
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "unstake",
                          gas: $$`200 Tgas`,
                          args: { amount: Big(10).pow(24).toFixed() },
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("lock all TX", res);
                    setLoading(false);
                  }}
                >
                  Unstake {toNear(Big(10).pow(24))}
                </button>

                <button
                  className="btn btn-primary ms-2"
                  disabled={
                    loading ||
                    !lockupId ||
                    knownDepositedBalance ||
                    !selectStakingPool
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "unstake_all",
                          gas: $$`200 Tgas`,
                          args: {},
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("lock all TX", res);
                    setLoading(false);
                  }}
                >
                  Unstake All
                </button>

                <button
                  className="btn btn-primary ms-2"
                  disabled={
                    loading ||
                    !lockupId ||
                    knownDepositedBalance ||
                    !selectStakingPool
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "withdraw_all_from_staking_pool",
                          gas: $$`200 Tgas`,
                          args: {},
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("lock all TX", res);
                    setLoading(false);
                  }}
                >
                  Withdraw All
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div key="deploy-lockup">
            <div>
              Lockup Deployment Cost: <code>{toNear(lockupCost)}</code>
            </div>
            <div>
              <button
                className="btn btn-primary"
                disabled={loading || !lockupCost}
                onClick={async () => {
                  setLoading(true);
                  const res = await near.sendTx({
                    receiverId: Constants.VENEAR_CONTRACT_ID,
                    actions: [
                      near.actions.functionCall({
                        methodName: "deploy_lockup",
                        gas: $$`100 Tgas`,
                        deposit: lockupCost,
                        args: {},
                      }),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("deploy TX", res);
                  setLoading(false);
                }}
              >
                Deploy Lockup Account
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
