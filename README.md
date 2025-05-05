# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## 参考URL
  
- [AWS LambdaのCustom Runtimeを使い、Node.js v8などEoLとなったランタイムを動かす](https://qiita.com/uhey22e/items/89a99c0cb6ad7eca567d)  
- [node-custom-lambda](https://github.com/lambci/node-custom-lambda) 
- [Node.js v23.6.0：TypeScriptサポートが登場](https://qiita.com/Leapcell/items/56b04d609bb41dc00fce)

# Lambdaレイヤーが読めない件のAmazon Qの回答
> AWS Lambdaのカスタムランタイムで、node_modulesを格納したLambdaレイヤーを読み込めません。環境変数は一通りただしく設定されていました。何か考えられる理由はあ
りますか？

AWS Lambdaのカスタムランタイムでnode_modulesを格納したLambdaレイヤーが読み込めない問題について、いくつかの考えられる原因と解決策を提案します。

考えられる原因:

1. NODE_PATH環境変数の設定不足
   • カスタムランタイムでは、通常のランタイムと異なりNODE_PATHが自動設定されないことがあります

2. レイヤーのディレクトリ構造の問題
   • Lambdaレイヤーのディレクトリ構造が正しくない可能性があります

3. アーキテクチャの不一致
   • レイヤーとLambda関数のアーキテクチャ(x86_64かarm64か)が一致していない可能性

4. パーミッションの問題
   • レイヤー内のファイルに適切な実行権限がない可能性

5. ブートストラップスクリプトの問題
   • カスタムランタイムのbootstrapスクリプトでモジュール検索パスが正しく設定されていない

解決策:

1. NODE_PATHの明示的な設定
  javascript
   // bootstrap スクリプト内で
   process.env.NODE_PATH = process.env.NODE_PATH + ':/opt/nodejs/node_modules:/opt/node_modules';
   

2. レイヤーのディレクトリ構造の確認
   • Node.jsのレイヤーは通常以下の構造にする必要があります:
    
     nodejs/
     └── node_modules/
         └── [パッケージ]
     
   • または
    
     node_modules/
     └── [パッケージ]
     

3. require.resolve()を使用したデバッグ
   • 関数内で以下のコードを実行して、モジュールの検索パスを確認:
  
javascript
   console.log(module.paths);
   try {
     console.log(require.resolve('パッケージ名'));
   } catch (e) {
     console.log('モジュール解決エラー:', e);
   }
   


4. lambci/node-custom-lambdaの参考
   • READMEに記載されているGitHubリポジトリ「node-custom-lambda」を参考に、カスタムランタイムの設定を確認してみてください

5. ブートストラップスクリプトの確認
   • カスタムランタイムのbootstrapスクリプトが正しくモジュールを読み込める設定になっているか確認

環境変数が正しく設定されているとのことですが、特にNODE_PATHが/opt/nodejs/node_modules:/opt/node_modulesを含んでいるか再確認してみてください。また、実際にデプロイされたLambda関数内でモジュールの検索パスをログ出力して確認することも有効です。

得にカスタムランタイムでは、NODE_PATHの設定やディレクトリ構造が重要になりま
すので、そこを重点的に確認してみてください。
