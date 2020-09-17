module.exports = {
  types: [
    // this line is used by starport scaffolding
		{ type: "commit", fields: ["solutionHash", "solutionScavengerHash", ] },
		{ type: "scavenge", fields: ["description", "solutionHash", "reward", "solution", "scavenger", ] },
  ],
};
