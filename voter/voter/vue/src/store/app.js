module.exports = {
  types: [
    // this line is used by starport scaffolding
		{ type: "vote", fields: ["pollID", "value", ] },
		{ type: "poll", fields: ["title", "options", ] },
  ],
};
