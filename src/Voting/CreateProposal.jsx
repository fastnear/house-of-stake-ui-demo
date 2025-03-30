import { useAccount } from "../hooks/useAccount.js";
import { useState } from "react";
import { Constants } from "../hooks/constants.js";

export function CreateProposal(props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [votingOptions, setVotingOptions] = useState([""]);

  return (
    <div className="mb-5">
      <h3 id="create-proposal">Create Proposal</h3>
      <div className="input-group mb-2">
        <span className="input-group-text">Title</span>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          className="form-control"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="input-group mb-2">
        <span className="input-group-text">Link</span>
        <input
          type="text"
          className="form-control"
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <label className="form-label" htmlFor="voting-options">
          Voting Options
        </label>
        <div>
          {votingOptions.map((option, index) => (
            <div key={index} className="input-group mb-2">
              <span className="input-group-text">Option {index + 1}</span>
              <input
                type="text"
                className="form-control"
                value={option}
                onChange={(e) => {
                  const newOptions = [...votingOptions];
                  newOptions[index] = e.target.value;
                  setVotingOptions(newOptions);
                }}
              />
              <button
                className="btn btn-outline-secondary"
                title="Remove option"
                onClick={() => {
                  const newOptions = [...votingOptions];
                  newOptions.splice(index, 1);
                  setVotingOptions(newOptions);
                }}
              >
                ❌
              </button>
            </div>
          ))}
          <div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setVotingOptions([...votingOptions, ""]);
              }}
            >
              ➕Add Option
            </button>
          </div>
        </div>
        <hr />
        <div>
          <button
            className="btn btn-primary mt-2"
            disabled={
              loading ||
              votingOptions.filter((f) => f.trim().length > 0).length < 2 ||
              !title ||
              !(description || link)
            }
            onClick={async () => {
              setLoading(true);
              const res = await near.sendTx({
                receiverId: Constants.VOTING_CONTRACT_ID,
                actions: [
                  near.actions.functionCall({
                    methodName: "create_proposal",
                    gas: $$`100 Tgas`,
                    deposit: $$`0.2 NEAR`,
                    args: {
                      metadata: {
                        title,
                        description,
                        link,
                        voting_options: votingOptions.filter(
                          (f) => f.trim().length > 0,
                        ),
                      },
                    },
                  }),
                ],
                waitUntil: "INCLUDED",
              });
              console.log("create proposal TX", res);
              setLoading(false);
            }}
          >
            Create Proposal
          </button>
        </div>
      </div>
    </div>
  );
}
