import { useState } from "react";
import { useNonce } from "../hooks/useNonce.js";
import { Constants } from "../hooks/constants.js";
import { useNearView } from "../hooks/useNearView.js";
import { Proposal } from "./Proposal.jsx";
import React from "react";

const MAX_NUM_PROPOSALS = 10;

export function VotingState(props) {
  const [loading, setLoading] = useState(false);
  const nonce = useNonce();
  const votingConfig = useNearView({
    initialValue: null,
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_config",
    args: {},
    extraDeps: [nonce],
    errorValue: "err",
  });
  const numProposals = useNearView({
    initialValue: null,
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_num_proposals",
    args: {},
    extraDeps: [nonce],
    errorValue: "err",
  });
  const lastProposals = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => !!extraDeps[1],
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_proposals",
    args: {
      from_index: Math.max(0, (numProposals || 0) - MAX_NUM_PROPOSALS),
    },
    extraDeps: [nonce, numProposals],
    errorValue: null,
  });
  const [showProposal, setShowProposal] = useState(null);

  const numApprovedProposals = useNearView({
    initialValue: null,
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_num_approved_proposals",
    args: {},
    extraDeps: [nonce],
    errorValue: "err",
  });
  const lastApprovedProposals = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => !!extraDeps[1],
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_approved_proposals",
    args: {
      from_index: Math.max(0, (numApprovedProposals || 0) - MAX_NUM_PROPOSALS),
    },
    extraDeps: [nonce, numApprovedProposals],
    errorValue: null,
  });
  const [activeProposalId, setActiveProposalId] = useState(null);

  return (
    <div className="mb-5">
      <h3 id="voting">Voting Contract State</h3>
      <div>
        Contract ID: <code>{Constants.VOTING_CONTRACT_ID}</code>
      </div>
      <div>
        Total number of Proposals:{" "}
        <code>{numProposals === null ? "..." : numProposals}</code>
      </div>
      <div>
        Pending Proposals:{" "}
        {lastProposals
          ? lastProposals
              .filter(
                (p) =>
                  !lastApprovedProposals ||
                  !lastApprovedProposals.find((p2) => p2.id === p.id),
              )
              .map((p) => {
                return (
                  <div key={p.id}>
                    <code
                      onClick={() => {
                        setShowProposal((oldId) =>
                          oldId === p.id ? null : p.id,
                        );
                      }}
                    >
                      #{p.id}: {p.title}
                    </code>
                  </div>
                );
              })
          : "..."}
      </div>
      {showProposal !== null && lastProposals && (
        <div className="mt-1 mb-3">
          <Proposal
            proposal={lastProposals[showProposal]}
            votingConfig={votingConfig}
          />
        </div>
      )}
      <div>
        Number of Approved Proposals:{" "}
        <code>
          {numApprovedProposals === null ? "..." : numApprovedProposals}
        </code>
      </div>
      <div>
        Latest Approved Proposals (select to display):{" "}
        <div className="d-grid gap-2 mt-2">
          {lastApprovedProposals
            ? lastApprovedProposals.toReversed().map((p) => {
                return (
                  <React.Fragment key={p.id}>
                    <input
                      className="btn-check"
                      type="radio"
                      checked={activeProposalId === p.id}
                      name="proposals"
                      id={`p-${p.id}`}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setActiveProposalId(p.id);
                        }
                      }}
                    />
                    <label
                      key={`l-${p.id}`}
                      className="btn btn-outline-primary text-start"
                      htmlFor={`p-${p.id}`}
                    >
                      #{p.id}: {p.title}
                    </label>
                  </React.Fragment>
                );
              })
            : "..."}
        </div>
      </div>
      {activeProposalId !== null && (
        <div key="active-proposal" className="mt-5">
          <Proposal
            proposal={lastApprovedProposals.find(
              (p) => p.id === activeProposalId,
            )}
            votingConfig={votingConfig}
          />
        </div>
      )}
    </div>
  );
}
