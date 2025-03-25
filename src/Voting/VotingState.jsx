import { useState } from "react";
import { useNonce } from "../hooks/useNonce.js";
import { Constants } from "../hooks/constants.js";
import { useNearView } from "../hooks/useNearView.js";

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
  const numApprovedProposals = useNearView({
    initialValue: null,
    contractId: Constants.VOTING_CONTRACT_ID,
    methodName: "get_num_approved_proposals",
    args: {},
    extraDeps: [nonce],
    errorValue: "err",
  });

  return (
    <div className="mb-3">
      <h3 id="voting">Voting Contract State</h3>
      <div>
        Contract ID: <code>{Constants.VOTING_CONTRACT_ID}</code>
      </div>
      <div>
        Number of Proposals:{" "}
        <code>{numProposals === null ? "..." : numProposals}</code>
      </div>
      <div>
        Number of Approved Proposals:{" "}
        <code>
          {numApprovedProposals === null ? "..." : numApprovedProposals}
        </code>
      </div>
    </div>
  );
}
