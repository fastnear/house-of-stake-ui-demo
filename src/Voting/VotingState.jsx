import { useState } from "react";
import { useNonce } from "../hooks/useNonce.js";
import { Constants } from "../hooks/constants.js";
import { useNearView } from "../hooks/useNearView.js";
import { Proposal } from "./Proposal.jsx";

const MAX_NUM_PROPOSALS = 10;

export function VotingState(props) {
  const [loading, setLoading] = useState(false);
  const nonce = useNonce();
  const numProposals = useNearView({
    initialValue: null,
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_num_proposals",
    args: {},
    extraDeps: [nonce],
    errorValue: "err",
  });
  const lastProposal = useNearView({
    initialValue: null,
    condition: ({ extraDeps }) => !!extraDeps[1],
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_proposals",
    args: {
      from_index: (numProposals || 0) - 1,
    },
    extraDeps: [nonce, numProposals],
    errorValue: null,
  })?.[0];

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
        Number of Proposals:{" "}
        <code>{numProposals === null ? "..." : numProposals}</code>
      </div>
      <div>
        Last Proposal: <code>{lastProposal ? lastProposal.title : "..."}</code>
      </div>
      <div>
        Number of Approved Proposals:{" "}
        <code>
          {numApprovedProposals === null ? "..." : numApprovedProposals}
        </code>
      </div>
      <div>
        Latest Approved Proposals (select to display):{" "}
        {lastApprovedProposals
          ? lastApprovedProposals.reverse().map((p) => {
              return (
                <div key={p.id}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      checked={activeProposalId === p.id}
                      name="proposals"
                      id={`option-${p.id}`}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setActiveProposalId(p.id);
                        }
                      }}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`option-${p.id}`}
                    >
                      #{p.id}: <code>{p.title}</code>
                    </label>
                  </div>
                </div>
              );
            })
          : "..."}
      </div>
      {activeProposalId !== null && (
        <div key="active-proposal" className="mt-5">
          <Proposal proposal={lastApprovedProposals[activeProposalId]} />
        </div>
      )}
    </div>
  );
}
