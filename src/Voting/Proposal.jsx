import { useAccount } from "../hooks/useAccount.js";
import { useEffect, useState } from "react";
import React from "react";

export function Proposal(props) {
  const proposal = props.proposal;
  console.log(proposal);
  const accountId = useAccount();
  const [loading, setLoading] = useState(false);
  const isVotingActive = proposal.status === "Voting";
  const [activeVote, setActiveVote] = useState(null);

  const yourVote = useEffect(() => {
    setActiveVote(null);
  }, [proposal]);

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
                {option}
              </label>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div>
        <a
          className="btn btn-success btn-lg"
          disabled={
            loading || !isVotingActive || !accountId || activeVote === null
          }
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        >
          VOTE
        </a>
      </div>
    </div>
  );
}
