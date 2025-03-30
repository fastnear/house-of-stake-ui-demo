import { useAccount } from "../hooks/useAccount.js";
import { Constants } from "../hooks/constants.js";
import { useEffect, useState } from "react";
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
  const lockupLiquidOwnersBalance = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_liquid_owners_balance",
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
  const withdrawableAmount =
    lockupLiquidOwnersBalance && lockupLiquidAmount
      ? Big(lockupLiquidOwnersBalance).gt(Big(lockupLiquidAmount))
        ? lockupLiquidAmount
        : lockupLiquidOwnersBalance
      : "0";
  const lockupPendingAmount = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_venear_pending_balance",
    args: {},
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  });
  const lockupUnlockTimestampNs = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_venear_unlock_timestamp",
    args: {},
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  });
  const untilUnlock = Math.max(
    0,
    parseFloat(lockupUnlockTimestampNs || "0") / 1e6 - new Date().getTime(),
  );
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
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_staking_pool_account_id",
    args: {},
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  });
  const knownDepositedBalance = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => extraDeps[1],
    contractId: lockupId,
    methodName: "get_known_deposited_balance",
    args: {},
    extraDeps: [nonce, isLockupDeployed],
    errorValue: null,
  });

  return (
    <div className="mb-5">
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
      <h3 id="lockup" className="mt-5">
        Lockup State
      </h3>
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
            {untilUnlock > 0 && (
              <div key={"until-unlock"}>
                Unlock in:{" "}
                <code>{Math.trunc(untilUnlock / 600) / 100} min</code>
              </div>
            )}
            <div>
              <button
                className="btn btn-primary"
                disabled={
                  loading ||
                  !lockupId ||
                  !accountBalance ||
                  Big(accountBalance).lt(Big(10).pow(24).mul(5))
                }
                onClick={async () => {
                  setLoading(true);
                  const res = await near.sendTx({
                    receiverId: lockupId,
                    actions: [
                      near.actions.transfer(Big(10).pow(24).mul(5).toFixed(0)),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("deposit TX", res);
                  setLoading(false);
                }}
              >
                Deposit {toNear(Big(10).pow(24).mul(5))}
              </button>

              <button
                className="btn btn-primary ms-2"
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
                  !lockedAmount ||
                  Big(lockedAmount).eq(0)
                }
                onClick={async () => {
                  setLoading(true);
                  const res = await near.sendTx({
                    receiverId: lockupId,
                    actions: [
                      near.actions.functionCall({
                        methodName: "begin_unlock_near",
                        gas: $$`100 Tgas`,
                        deposit: "1",
                        args: {},
                      }),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("begin_unlock_near TX", res);
                  setLoading(false);
                }}
              >
                Begin unlock {toNear(lockedAmount)}
              </button>

              <button
                className="btn btn-primary ms-2"
                disabled={
                  loading ||
                  !lockupId ||
                  !lockupPendingAmount ||
                  Big(lockupPendingAmount).eq(0) ||
                  untilUnlock > 0
                }
                onClick={async () => {
                  setLoading(true);
                  const res = await near.sendTx({
                    receiverId: lockupId,
                    actions: [
                      near.actions.functionCall({
                        methodName: "end_unlock_near",
                        gas: $$`100 Tgas`,
                        deposit: "1",
                        args: {},
                      }),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("end_unlock_near TX", res);
                  setLoading(false);
                }}
              >
                {untilUnlock > 0 && "⌛ "}Finish unlock{" "}
                {toNear(lockupPendingAmount)}
              </button>

              <button
                className="btn btn-secondary ms-2"
                disabled={
                  loading ||
                  !lockupId ||
                  !withdrawableAmount ||
                  Big(withdrawableAmount).lt(Big(10).pow(21))
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
                          amount: withdrawableAmount,
                          receiver_id: accountId,
                        },
                      }),
                    ],
                    waitUntil: "INCLUDED",
                  });
                  console.log("transfer TX", res);
                  setLoading(false);
                }}
              >
                Transfer to owner {toNear(withdrawableAmount)}
              </button>

              {!stakingPool ? (
                <div key="select-pool" className={"mt-2"}>
                  Select Staking Pool:
                  <div className="input-group">
                    <input
                      className="form-control"
                      type={"textbox"}
                      value={selectStakingPool}
                      onChange={(e) => setSelectStakingPool(e.target.value)}
                    />
                    <button
                      className="btn btn-primary"
                      disabled={loading || !lockupId}
                      onClick={async () => {
                        setLoading(true);
                        const res = await near.sendTx({
                          receiverId: lockupId,
                          actions: [
                            near.actions.functionCall({
                              methodName: "select_staking_pool",
                              gas: $$`100 Tgas`,
                              deposit: "1",
                              args: {
                                staking_pool_account_id: selectStakingPool,
                              },
                            }),
                          ],
                          waitUntil: "INCLUDED",
                        });
                        console.log("select_staking_pool TX", res);
                        setLoading(false);
                      }}
                    >
                      Select Staking Pool
                    </button>
                  </div>
                </div>
              ) : (
                <div key="unselect-pool" className={"mt-2"}>
                  <div key={"staking-pool"}>
                    Selected Staking Pool: <code>{stakingPool}</code>
                    <div key={"known-deposited-balance"}>
                      Known Deposited Balance:{" "}
                      <code>{toNear(knownDepositedBalance)}</code>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={loading || !lockupId || !stakingPool}
                    onClick={async () => {
                      setLoading(true);
                      const res = await near.sendTx({
                        receiverId: lockupId,
                        actions: [
                          near.actions.functionCall({
                            methodName: "refresh_staking_pool_balance",
                            gas: $$`100 Tgas`,
                            deposit: "1",
                            args: {},
                          }),
                        ],
                        waitUntil: "INCLUDED",
                      });
                      console.log("refresh_staking_pool_balance TX", res);
                      setLoading(false);
                    }}
                  >
                    Refresh staking pool balance
                  </button>

                  <button
                    className="btn btn-warning ms-2"
                    disabled={
                      loading ||
                      !lockupId ||
                      !stakingPool ||
                      !knownDepositedBalance ||
                      Big(knownDepositedBalance).gt(0)
                    }
                    onClick={async () => {
                      setLoading(true);
                      const res = await near.sendTx({
                        receiverId: lockupId,
                        actions: [
                          near.actions.functionCall({
                            methodName: "unselect_staking_pool",
                            gas: $$`100 Tgas`,
                            deposit: "1",
                            args: {
                              staking_pool_account_id: selectStakingPool,
                            },
                          }),
                        ],
                        waitUntil: "INCLUDED",
                      });
                      console.log("unselect_staking_pool TX", res);
                      setLoading(false);
                    }}
                  >
                    Unselect staking pool
                  </button>
                </div>
              )}

              <div className={"mt-2"}>
                <button
                  className="btn btn-primary"
                  disabled={
                    loading ||
                    !lockupId ||
                    !stakingPool ||
                    !lockupLiquidOwnersBalance ||
                    Big(lockupLiquidOwnersBalance).lt(Big(10).pow(21))
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "deposit_and_stake",
                          gas: $$`200 Tgas`,
                          deposit: "1",
                          args: { amount: lockupLiquidOwnersBalance },
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("deposit_and_stake TX", res);
                    setLoading(false);
                  }}
                >
                  Stake {toNear(lockupLiquidOwnersBalance)}
                </button>

                <button
                  className="btn btn-primary ms-2"
                  disabled={
                    loading ||
                    !lockupId ||
                    !stakingPool ||
                    !knownDepositedBalance ||
                    Big(knownDepositedBalance).eq(0)
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "unstake",
                          gas: $$`200 Tgas`,
                          deposit: "1",
                          args: { amount: Big(10).pow(24).toFixed() },
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("unstake TX", res);
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
                    !knownDepositedBalance ||
                    Big(knownDepositedBalance).eq(0)
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "unstake_all",
                          gas: $$`200 Tgas`,
                          deposit: "1",
                          args: {},
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("unstake_all TX", res);
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
                    !stakingPool ||
                    !knownDepositedBalance ||
                    Big(knownDepositedBalance).eq(0)
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "withdraw_all_from_staking_pool",
                          gas: $$`200 Tgas`,
                          deposit: "1",
                          args: {},
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("withdraw_all_from_staking_pool TX", res);
                    setLoading(false);
                  }}
                >
                  Withdraw All
                </button>

                <button
                  className="btn btn-danger ms-2"
                  disabled={
                    loading ||
                    !lockupId ||
                    !lockedAmount ||
                    lockedAmount !== "0"
                  }
                  onClick={async () => {
                    setLoading(true);
                    const res = await near.sendTx({
                      receiverId: lockupId,
                      actions: [
                        near.actions.functionCall({
                          methodName: "delete_lockup",
                          gas: $$`200 Tgas`,
                          args: {},
                          deposit: "1",
                        }),
                      ],
                      waitUntil: "INCLUDED",
                    });
                    console.log("delete lockup TX", res);
                    setLoading(false);
                  }}
                >
                  DELETE LOCKUP 💣
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
