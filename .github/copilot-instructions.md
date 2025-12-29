<!-- copilot-instructions for SpringDemo project -->
# Copilot 指示書 — SpringDemo

目的: このリポジトリで即戦力になるための最小限の手がかりを提供します。変更は必ず小さく、既存の命名規則とパッケージ構成に従ってください。

- **大枠アーキテクチャ**:
  - Spring Boot アプリケーション（エントリ: `src/main/java/com/example/demo/DemoApplication.java`）
  - 層構造: `controller` → `service` → `dao`（JPA エンティティ + `UserRepository`）
  - テンプレート: Thymeleaf テンプレートは `src/main/resources/templates`（例: `hello.html`, `users.html`）
  - 起動時初期データは `src/main/java/com/example/demo/dao/DataLoader.java` で CommandLineRunner を使って追加

- **主要ファイル（参照例）**
  - `src/main/java/com/example/demo/DemoApplication.java` — アプリ起点
  - `src/main/java/com/example/demo/controller/HelloController.java` — サンプルのルーティング + view 名
  - `src/main/java/com/example/demo/controller/UserController.java` — フォーム受け取りとリダイレクトのパターン
  - `src/main/java/com/example/demo/service/UserService.java` — ビジネスロジック層の典型
  - `src/main/java/com/example/demo/dao/User.java` / `UserRepository.java` — Entity と JpaRepository
  - `src/main/resources/application.properties` / `application.yml` — DB（H2 インメモリ）と JPA 設定

- **ビルド / 実行 / テスト（Windows）**
  - ビルド: `gradlew.bat build`  
  - 実行（開発）: `gradlew.bat bootRun`  または `java -jar build/libs/*-SNAPSHOT.jar`（ビルド後）
  - テスト: `gradlew.bat test`

- **プロジェクト固有の挙動・約束事**
  - DB はデフォルトで H2 のインメモリを使用（`application.yml` を参照）。スキーマは `spring.jpa.hibernate.ddl-auto` = `update`。
  - テンプレート名を返すコントローラ（例: `return "users"`）は `templates/users.html` に対応する
  - 初期データ挿入は `DataLoader`（CommandLineRunner）で行うため、変更は起動時の副作用に注意
  - `UserRepository` は `JpaRepository<User, Long>` を継承しているため CRUD は自動提供

- **コードパターンの具体例**
  - コントローラで Model に属性を詰める → Thymeleaf 側で `th:each` / `th:text` を使う（参照: `UserController` / `users.html`）
  - サービス層はリポジトリのラッパー（軽量）として実装済み（参照: `UserService`）

- **デバッグ / ログ**
  - `application.yml` で `spring.jpa.show-sql: true` が有効。SQL を確認するときはここを参照
  - H2 コンソールは `spring.h2.console.enabled: true`（開発時に便利）

- **PR / 変更方針**
  - 小さい単位で変更する（単一責任）。コントローラ / サービス / DAO の責任を越えない。
  - テンプレートを変更する場合は、対応するコントローラの返却値と Model 属性名を合わせる。

もしここで不明点や追加してほしい項目があれば教えてください。必要なら具体的なサンプル PR を作成します。
