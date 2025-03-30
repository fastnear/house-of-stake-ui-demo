import { useAccount } from "../hooks/useAccount.js";
import { useEffect, useState } from "react";
import React from "react";
import { useNearView } from "../hooks/useNearView.js";
import { Constants } from "../hooks/constants.js";
import { useNonce } from "../hooks/useNonce.js";
import { processAccount } from "../hooks/utils.js";

export function Proposal(props) {
  const { proposal, votingConfig } = props;
  const accountId = useAccount();
  const nonce = useNonce();
  const [loading, setLoading] = useState(false);
  const isVotingActive = proposal.status === "Voting";
  const [activeVote, setActiveVote] = useState(null);

  const existingVote = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => !!extraDeps[1],
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_vote",
    args: {
      account_id: accountId,
      proposal_id: proposal.id,
    },
    extraDeps: [nonce, accountId],
    errorValue: null,
  });

  const snapshotBlockHeight =
    proposal?.snapshot_and_state?.snapshot?.block_height;
  let [merkleProof, vAccount] = useNearView({
    initialValue: [null, null],
    condition: ({ extraDeps: [nonce, accountId, snapshotBlockHeight] }) =>
      !!accountId && !!snapshotBlockHeight,
    contractId: Constants.VENEAR_CONTRACT_ID,
    methodName: "get_proof",
    args: {
      account_id: accountId,
    },
    blockId: snapshotBlockHeight,
    extraDeps: [nonce, accountId, snapshotBlockHeight],
    errorValue: [null, null],
  });
  // Temp fix for older contract version
  if (vAccount && vAccount.Current) {
    vAccount = {
      V0: vAccount.Current,
    };
  }
  const account = vAccount?.V0 ? processAccount(vAccount?.V0) : null;

  useEffect(() => {
    setActiveVote(null);
  }, [proposal]);

  useEffect(() => {
    if (activeVote === null && existingVote !== null) {
      setActiveVote(existingVote);
    }
  }, [proposal, activeVote, existingVote]);

  return (
    <div>
      <h3>Proposal #{proposal.id}</h3>
      <div>
        <strong>Title:</strong> {proposal.title}
      </div>
      <div>
        <strong>Proposer:</strong>{" "}
        <a
          href={`https://testnet.nearblocks.io/address/${proposal.proposer_id}`}
        >
          <code>{proposal.proposer_id}</code>
        </a>
      </div>
      <div>
        <strong>Status:</strong> {proposal.status}
      </div>
      <div>
        <strong>Description:</strong> <p>{proposal.description}</p>
      </div>
      <div>
        <strong>Link:</strong>{" "}
        <a href={proposal.link} target="_blank">
          {proposal.link}
        </a>
      </div>
      <div>
        <strong>Voting Options:</strong>
        <div className="d-grid gap-2 ms-1 mb-2">
          {proposal.voting_options.map((option, index) => (
            <React.Fragment key={index}>
              <input
                className="btn-check"
                type="radio"
                checked={activeVote === index}
                name="votes"
                id={`option-${index}`}
                onChange={(e) => {
                  if (e.target.checked) {
                    setActiveVote(index);
                  }
                }}
              />
              <label
                className="btn btn-outline-primary text-start"
                htmlFor={`option-${index}`}
              >
                {existingVote === index && (
                  <span key={"vote"} title={"Your existing vote"}>
                    ✅{" "}
                  </span>
                )}
                {option}
              </label>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div>
        <button
          className="btn btn-success btn-lg"
          disabled={
            loading ||
            !isVotingActive ||
            !accountId ||
            activeVote === null ||
            !account ||
            account?.totalBalance.eq(0)
          }
          onClick={async () => {
            setLoading(true);
            const res = await near.sendTx({
              receiverId: Constants.VOTING_CONTRACT_ID,
              actions: [
                near.actions.functionCall({
                  methodName: "vote",
                  gas: $$`100 Tgas`,
                  deposit: votingConfig.vote_storage_fee,
                  args: {
                    proposal_id: proposal.id,
                    vote: activeVote,
                    merkle_proof: merkleProof,
                    v_account: vAccount,
                  },
                }),
              ],
              waitUntil: "INCLUDED",
            });
            console.log("vote TX", res);
            setLoading(false);
          }}
        >
          {existingVote !== null && activeVote !== existingVote && "CHANGE"}{" "}
          VOTE with{" "}
          {account
            ? `${account.totalBalance.div(1e24).toFixed(3)} veNEAR`
            : "..."}
        </button>
      </div>
    </div>
  );
}
