// 参考：https://zenn.dev/kou_pg_0131/articles/ghats-introduction
//      https://docs.github.com/ja/actions/writing-workflows/quickstart

// ghats から Workflow, Job を import
import { Workflow, Job } from "ghats";

// workflow を定義
const workflow = new Workflow("Hello", {
  on: {
    push: {
      branches: ["develop"],
    },
  }
});

// job を定義
workflow.addJob(
  new Job("hello", {
    runsOn: "ubuntu-latest",
  })
    .uses("actions/checkout@v4", {
      with: { "persist-credentials": "false"}
    })
    .run("echo 'Hello, world!'"),
);

// workflow を default export
export default workflow;