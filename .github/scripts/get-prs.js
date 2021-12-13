module.exports = async ({ github, context }) => {
  const { owner, repo } = context.repo;

  if(!context.payload.workflow_run) {
    console.log("Not a workflow run: ", { branch: context.ref, sha: context.sha });
    return { labels: [], check_ids: [], branch: context.ref, sha: context.sha };
  }

  let data = await Promise.all(
    context.payload.workflow_run.pull_requests.map(pr => pr.number)
           .map(async (pull_number) => {
             let pr = await github.rest.pulls.get({
               owner, repo,
               pull_number
             });

             let labels = pr.data.labels.map(label => label.name);

             if(labels.includes('e2e')) {
               const check = await github.rest.checks.create({
                 owner, repo,
                 head_sha: pr.data.head.sha,
                 name: "E2E Tests",
                 details_url: `${ context.payload.repository.url}/actions/runs/${ context.runId }`,
                 status: "in_progress"
               });

               const check_id = check.data.id;
               const branch = pr.data.head.ref;
               const sha = pr.data.head.sha;
               return { labels, check_id, branch, sha };
             }

             return { labels };
           })
  );

  if(data.length === 0) {
    console.log("Found 0 PRs matching this commit", { branch: context.ref, sha: context.sha });
    return { labels: [], check_ids: [], branch: context.ref, sha: context.sha };
  }

  const labels = data.map(d => d.labels).flat();
  const check_ids = data.map(d => d.check_id).filter(c => !!c);
  const branch = data.map(d => d.branch).filter(c => !!c).shift();
  const sha = data.map(d => d.sha).filter(c => !!c).shift();

  return {
    labels, check_ids, branch, sha
  };
};
