import { useAccount } from "../hooks/useAccount.js";

export function Proposal(props) {
  const proposal = props.proposal;
  const accountId = useAccount();

  return (
    <div>
      <h3>Proposal #{proposal.id}</h3>
      <div>
        <strong>Title:</strong> {proposal.title}
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
        <ul>
          {proposal.voting_options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
