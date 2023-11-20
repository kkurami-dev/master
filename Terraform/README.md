# (AWS 公式)AWS での Terraform 管理リソースのビルディングブロック
  ※GitHub に AWS が公開している Terraform のマニュアル類がある
  https://aws.amazon.com/jp/quickstart/terraform-modules/?quickstart-all.sort-by=item.additionalFields.sortDate&quickstart-all.sort-order=desc

# (Terraform 公式マニュアル)AWS Provider
  ※各サービスの使い方(本物)
  https://registry.terraform.io/providers/hashicorp/aws/latest/docs

# Terraformを使ってみる(AWS)
  https://www.bigtreetc.com/column/terraform/

# AWS コンソールで作成した物を Terraform 管理下に置く)
 ・Terraformで既存のインフラリソースをインポートする方法
   https://beyondjapan.com/blog/2020/05/terraform-resource-import/

 ・パラメーターファイルで複数環境管理 - Terraformのきほんと応用
   https://zenn.dev/sway/articles/terraform_biginner_envbyvarfile

 ・Terraformで、同じ構成を複数プロビジョニングしたい: Terragruntでbackendを動的設定編
   https://dev.classmethod.jp/articles/dynamic-backend-with-terragrunt/

 ・既存リソースをTerraformでimportする作業を楽にする
   https://techblog.kayac.com/terraform-import-easier

 ・Terraformプロバイダから動的に型定義情報を取得するtfschemaというツールを作った
   https://engineer.crowdworks.jp/entry/2018/03/27/173704

# (非公式)AWS サービスそれぞれの設定
 ・(IAM)[初学者向け]Terraform によるIAM ポリシー/ロール の作り方
   https://oji-cloud.net/2022/03/25/post-6984/

 ・(Cognito)Terraformでサーバーレスな会員制サイトを構築する
   https://qiita.com/okubot55/items/fa0625bb98ffa771cdc4

 ・(S3)TerraformでS3を構築
   https://cloud5.jp/terraform-s3/

 ・(Glue)AWS Glue WorkflowsをTerraformで構築する
   https://zenn.dev/pageo/articles/e4fc7c6a58188c

 ・(EventBridge)【AWS lambda】lambdaの定期実行(EventBridge:CloudWatch Events)をTerraformで設定する
   https://magical-academia.com/libraries/aws-lambda-terraform-batch

 ・(Lambda)Terraformで、AWS Lambda関数を登録して動かしてみる
   https://qiita.com/charon/items/19ab5087f7036dafce4b

 ・(ACM)Terraform で AWS Certificate Manager 無料証明書を発行する（AWS Provider 3.0.0 以降の場合）
   https://dev.classmethod.jp/articles/terraform-aws-certificate-validation/

 ・(API Gateway 1)Terraform で API Gateway（REST API）を構築する
   https://dev.classmethod.jp/articles/terraform-deployment-rest-api-gateway/

 ・(API Gateway 2)APIGateway のカスタムドメイン ↑


 ・(Route53)TerraformでRoute53のレコード作成
   https://zenn.dev/nicopin/books/58c922f51ea349/viewer/a6ef17

# 起動
 ・設定( アクセスキー設定 )
    $ terraform apply \
    -var 'access_key=AKIAXXXXXXXXXXXXXXXXXX' \
    -var 'secret_key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    
    or
    
    terraform.tfvars
    ---
    aws_access_key = "AKIAXXXXXXXXXXXXXXXXXX"
    aws_secret_key = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

 ・設定( proxy )
    https://future-architect.github.io/articles/20190816/

    # MacOSの場合
    export HTTPS_PROXY=https://proxy.example.com:443
    
    # Windowsの場合
    set HTTPS_PROXY=https://proxy.example.com:443

