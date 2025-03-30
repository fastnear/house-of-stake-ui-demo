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
  const [showLast, setShowLast] = useState(false);

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
        Last Proposal:{" "}
        <code onClick={() => lastProposal && setShowLast((s) => !s)}>
          {lastProposal ? lastProposal.title : "..."}
        </code>
      </div>
      {showLast && lastProposal && (
        <div className="mt-5">
          <Proposal proposal={lastProposal} />
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
        <div className="d-grid gap-2">
          {lastApprovedProposals
            ? lastApprovedProposals.toReversed().map((p) => {
                return (
                  <>
                    <input
                      key={`i-${p.id}`}
                      className="btn-check"
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
                      key={`l-${p.id}`}
                      className="btn btn-outline-primary text-start"
                      htmlFor={`option-${p.id}`}
                    >
                      #{p.id}: {p.title}
                    </label>
                  </>
                );
              })
            : "..."}
        </div>
      </div>
      {activeProposalId !== null && (
        <div key="active-proposal" className="mt-5">
          <Proposal proposal={lastApprovedProposals[activeProposalId]} />
        </div>
      )}
    </div>
  );
}
