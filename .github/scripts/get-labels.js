module.exports = async ({ github, context }) => {
  console.log(context);
  if (context.eventName === 'pull_request') {
    const pr = context.payload.pull_request;
    return pr.labels.map(label => label.name);
  }

  const prs = await github.rest.search.issuesAndPullRequests({
    q: 'is:pr is:open SHA:' + context.sha
  });

  console.log("PRs:", prs);

  return prs
    .data.items
    .flatMap(e => e.labels)
    .map(label => label.name);
};
