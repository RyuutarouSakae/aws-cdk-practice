const fs = require("fs");

module.exports = async ({ github, context, core }) => {
  try {
    const diffOutput = fs.readFileSync("aws-cdk/diff_output.txt", "utf8");

    // PRの現在の本文を取得
    const pr = await github.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number,
    });

    // CDK Diffのセクションを作成
    const cdkDiffSection = `## CDK Diff Results\n\`\`\`${diffOutput}\`\`\``;

    // 既存のCDK Diffセクションを削除（もし存在すれば）
    let body = pr.data.body || "";
    body = body
      .replace(/## CDK Diff Results[\s\S]*?```[\s\S]*?```/g, "")
      .trim();

    // 新しいCDK Diffセクションを追加
    const updatedBody = body + "\n\n" + cdkDiffSection;

    // PRの本文を更新
    await github.rest.pulls.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: context.issue.number,
      body: updatedBody,
    });
  } catch (error) {
    core.setFailed(`Action failed with error: ${error}`);
  }
};
