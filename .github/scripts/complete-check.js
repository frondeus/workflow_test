module.exports = ({ github, context, check_ids, status }) => {
    const { owner, repo } = context.repo;

    for(let check_run_id of check_ids) {
        github.rest.checks.update({
            owner,
            repo,
            check_run_id,
            status: "completed",
            conclusion: status,
            output: {
                title: "E2E Tests result",
                summary: "See link below to get details"
            }
        });
    }
};
