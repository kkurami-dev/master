-*- mode: markdown  coding: utf-8-unix; -*- Time-stamp: "2020-06-22 20:26:27 kuramitu"
--------------------------------------------------------------------------------

# Hyperledger Fabric
## チュートリアル
  - [Hyperledger Fabric入門 第1回 基本的な構成 – IBM Developer](https://developer.ibm.com/jp/technologies/blockchain/tutorials/cl-hyperledger-fabric-basic-1/)
  - [Hyperledger Fabric 入門, 第 2 回 Peer/チャネル/Endorsement Policy の解説](https://www.ibm.com/developerworks/jp/cloud/library/cl-hyperledger-fabric-basic-2/index.html)
  - [Hyperledger Fabric入門 第3回 コンセンサス/Ordering Service/Kafka/Zookeeper](https://developer.ibm.com/jp/tutorials/cl-hyperledger-fabric-basic-3/)
  - [Hyperledger Fabric 入門, 第 4 回 Membership Service Provider](https://www.ibm.com/developerworks/jp/cloud/library/cl-hyperledger-fabric-basic-4/index.html)
  - [Hyperledger Fabric 入門, 第 5 回 チェーンコードの書き方](https://www.ibm.com/developerworks/jp/cloud/library/cl-hyperledger-fabric-basic-5/index.html)
  - [Hyperledger Fabric 入門, 第 6 回 Hyperledger Fabric v1.4 のプログラミングモデル](https://www.ibm.com/developerworks/jp/cloud/library/cl-hyperledger-fabric-basic-6/index.html)
  - [Fabcar](https://hyperledger-fabric.readthedocs.io/en/release-1.4/write_first_app.html)
  - [Docs](https://hyperledger-fabric.readthedocs.io/en/release-2.0/#)
  - [ドキュメント » 主要な概念 » ブロックチェーンネットワーク](https://hyperledger-fabric.readthedocs.io/en/latest/network/network.html)
  - [OCHaCafe #4 Hyperledger Fabric アプリケーション設計入門ガイド](https://speakerdeck.com/gakumura/ochacafe-number-4-hyperledger-fabric)
  -  [Hyperledger Fabricでアプリケーション設計するのに参考にした情報](https://qiita.com/kai_kou/items/8314e8e18c3d679947c0)

## 今回は下記の v2.0.0 を利用します
  - 公式な GitHub かソースとサンプルはを取得して解析を行う。
    サンプルのベースは Fabcar です。
    - [ソースコード](https://github.com/hyperledger/fabric)
    - [サンプル](https://github.com/hyperledger/fabric-samples)

  - Git のクライアントは Git Extensions がオススメ

## fabcar 基本部分:

## fast-network 基本部分 :

    startFabric.sh
    javascript-low-level/enrollAdmin.js
    javascript-low-level/invoke.js
    javascript-low-level/package.json
    javascript-low-level/query.js
    javascript-low-level/registerUser.js

## basic-network 基本部分 :
    .env
    config
    configtx.yaml
    connection.json
    connection.yaml
    crypto-config
    crypto-config.yaml
    docker-compose.yml
    generate.sh
    init.sh
    start.sh
    stop.sh
    teardown.sh

--------------------------------------------------------------------------------

# OpenSSL
別リポジトリにある 

--------------------------------------------------------------------------------
# AWS
## CloudWatch
  - [EC2 Linux インスタンスから CloudWatch にカスタムメトリクスをプッシュするにはどうすればよいですか ?](https://aws.amazon.com/jp/premiumsupport/knowledge-center/cloudwatch-custom-metrics/)
  - [カスタムメトリクスを発行する](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/publishingMetrics.html)

  - [Linux での AWS CLI バージョン 2 のインストール](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html)
``` shell
$ aws --version
$ curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
$ unzip awscliv2.zip
$ sudo ./aws/install
$ aws --version
```
  - [AWS CLI の設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-configure.html)
   1. AWS CLI のかんたん設定
``` shell
$ aws configure
   AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
   AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   Default region name [None]: ap-northeast-1
   Default output format [None]: json
```
com.amazonaws.ap-northeast-1.monitoring
*エンドポイント monitoring のセキュリティグループにインバウンドルール
で送信元を許可していないと遅れない*

  - エンドポイントとの疎通確認
  `dig monitoring.ap-northeast-1.amazonaws.com`

## CloudWatch エージョント
  - [CloudWatch エージェントで使用する IAM ロールおよびユーザーを作成する](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/create-iam-roles-for-cloudwatch-agent.html)
  EC2のロールに CloudWatch への書き込み権限を許可
  *CloudWatchAgentServerPolicy* のポリシーを付けるを付ける
  
  - [CloudWatch エージェント設定ファイルを手動で作成または編集する](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)
  設定ファイル作成
  
  - [設定ファイル](https://docs.aws.amazon.com/ja_jp/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html)
  - CloudWatch エージョントの状態確認__
  `$ amazon-cloudwatch-agent-ctl -m ec2 -a status`
  - 設定ファイル名  
  `amazon-cloudwatch-agent.json`
  - 設定ファイルの場所  
  `/opt/aws/amazon-cloudwatch-agent/etc/`

## AWS Certificate Manager
- [AWS Certificate Manager とは](https://docs.aws.amazon.com/ja_jp/acm/latest/userguide/acm-overview.html)
- [証明書発行コマンドリファレンス](https://docs.aws.amazon.com/cli/latest/reference/acm/request-certificate.html)

コマンド
```
#!/bin/bash

# https://docs.aws.amazon.com/cli/latest/reference/acm/request-certificate.html

aws acm request-certificate \
--domain-name www.example.com \
--idempotency-token 12563 \
--options CertificateTransparencyLoggingPreference=DISABLED \
--certificate-authority-arn arn:aws:acm-pca:region:account:\
certificate-authority/12345678-1234-1234-1234-123456789012

# 
# {
#     "CertificateArn": "arn:aws:acm:region:account:certificate/12345678-1234-1234-1234-123456789012"
# }
```
  - --domain-name : 
  - --idempotency-token : 
  - --options : 
  - --certificate-authority-arn : プライベート認証局（CA）のAmazonリソースネーム（ARN
  - --tags : 


### StatsD, collectd 収集した内容も記録可能


## AWS を CloudMapper で視覚か
    VPC とサブネット(https://docs.aws.amazon.com/ja_jp/vpc/latest/userguide/VPC_Subnets.html)
    これだけ押さえておけば大丈夫！Webサービス向けVPCネットワークの設計指針

``` shell
    $ sudo apt install -y autoconf automake libtool python3.7-dev python3-tk jq awscli python3.7-distutils
    $ curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    $ python3.7 get-pip.py --user
    $ pip3.7 install --user pipenv
    $ git clone https://github.com/duo-labs/cloudmapper.git
    $ cd cloudmapper
    $ pipenv install --skip-lock
    $ pipenv shell
    (cludmapper) $ python cloudmapper.py prepare --config config.json.demo --account demo
    (cludmapper) $ python cloudmapper.py report --config config.json.demo --account demo
    (cludmapper) $ python cloudmapper.py webserver
```

  ## Ansible
   ### Linux にコマンドのインストール
     $ sudo apt install -y ansible
   
   ### 鍵を作成
     $ ssh-keygen
   
   ### その他
    [Ansibleで始めるインフラ構築自動化](https://www.slideshare.net/dcubeio/ansible-72056386)
    [AnsibleでAWS環境を自動構築する](https://qiita.com/rednes/items/2963bc367d7d84db81a0)
   ```
   $ ansible-playbook -i hosts site.yml --check
    [その他のオプション]
      -D, --diffオプション
       ファイル等の変更差分内容を出力
     --syntax-check
       playbook のシンタックスを検査
     --list-tasks
       実行されるタスクの一覧を表示
     --start-at-taskオプション(="task名")
       playbookを途中から実行する場合に有効
    --step
      playbook を (N)o/(y)es/(c)ontinue入寮でステップ実行
    [代表モジュール]
      - file : ファイル/ディレクトリ作成や所有者/権限変更
      - copy : リモートホストにファイルを転送
      - template : テンプレートファイル(jinja2)を展開したフィルをリモートホストへ転送
      - get_url : 指定URLからファイルをダウンロード
      - lineinfile : リモートホストのファイルで正規表現にマッチする行の書き換え
      - shell : シェルの実行
      - yum / apt : 対象Linuxのパッケージ操作コマンドを実行
      - service : サービス操作
   ```  
  ## Ansible Tower
    Ansible の管理・操作用のWeb GUIインタフェース
    10ホストまでは無料、それ以上は優勝
    ホストの状態はAnsible Towerでも管理可能
    
    ### Basic creation example with tags and increase the retention period from the default 24 hours to 48 hours:
    - name: Set up Kinesis Stream with 10 shards, tag the environment, increase the retention period and wait for the stream to become ACTIVE
      kinesis_stream:
        name: test-stream
        retention_period: 48
        shards: 10
        tags:
          Env: development
        wait: yes
        wait_timeout: 600
      register: test_stream
      
  ## CloudFormation
  
  ## Vagrant で仮想マシン立ち上げ
  
  ## ssh
     ec2-3-112-36-187.ap-northeast-1.compute.amazonaws.com
     ARG1.pem
     ARG1.pem.ppk
     ARG1.pub.ppk

#​ansible
[ansibleによるEC2・VPC環境構築(その3)](https://coatiblog.sios.jp/ansibleによるec2・vpc環境構築その3/)

## Kinesis ストリームの作成
```
- name: Set up Kinesis Stream with 10 shards, tag the environment, increase the retention period and wait for the stream to become ACTIVE
  kinesis_stream:
    name: test-stream
    retention_period: 48
    shards: 10
    tags:
      Env: development
    wait: yes
    wait_timeout: 600
  register: test_stream
```


## VPCピアリング接続
ec2_vpc_peerモジュールを使い、接続するVPCをそれぞれ指定して、VPCピアリング接続を行います。
このplaybookを実行したあと、お客様に接続を承認していただくと、晴れて両VPCがピアリング接続されることになります。
```
---
- name: include vars
  include_vars: '/tmp/__temp_fact__.yml'

- name: Setup VPC peering for customer
  ec2_vpc_peer:
    region: "{{ REGION }}"
    vpc_id: "{{ manager_vpc_id }}"
    peer_vpc_id: "{{ PEERING_VPC_ID }}"
    peer_owner_id: "{{ PEER_OWNER_ID }}"
    state: present
    tags:
      Name: Peering connection for "{{ CUSTOMER }}"
  register: vpc_peering_for_customer
```

----
# 用語
## [CIDR とは](https://www.nic.ad.jp/ja/basics/terms/cidr.html)
「Classless Inter-Domain Routing」の略。サイダーと読みます。CIDRは、ク ラスを使わないIPアドレスの割り当てと、経路情報の集成を行う技術です。ク ラスとは、IPアドレスのネットワーク部とホスト部を決められたブロック単位 で区切る方法で、簡単ですがアドレス空間の利用に無駄が生じてしまいます。 これに対しクラスを使わないCIDRでは、任意のブロック単位で区切ることがで きるため、IPアドレス空間を効率的に利用することができます。

--------------------------------------------------------------------------------

# Windows の WSL で Linux を動作させる

[WSL 2 のインストール，Ubuntu 18.04 のインストール](https://www.kkaneko.jp/tools/wsl/wsl2.html)
1. 「Windows の機能の有効化または無効化」で，
  「仮想マシンプラットフォーム」
-

1. Windows Subsubsystem for Linux のインストールの確認
- PowerShell を，管理者として実行
- > dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

1. 仮想マシンプラットフォームのオプションコンポーネントのインストールの確認
- PowerShell を，管理者として実行
- > dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

1. Linux ディストリビューションのインストール
  1. > start ms-windows-store:
  1. Linux を検索
  1. Ubuntu 18.04 LTS をインストール
  1. 起動
    - エラー対応：WslRegisterDistribution failed with error: 0x8007019e
      [Windows 10 WSL を有効にする方法](https://kb.seeck.jp/archives/8788)
      1. PowerShell を管理者権限で起動
      1. > Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux

1. インストール済みの Linux ディストリビューションの確認
※ Microsoft Windows [Version 10.0.18363.778] では未確認
- > wsl -l -v
- WSL のバージョンを 2 に変更する．
  > wsl --set-version Ubuntu-18.04 2
  > wsl -l -v

## コンパイル環境の整備
> sudo apt update
> sudo apt -y install g++ make

