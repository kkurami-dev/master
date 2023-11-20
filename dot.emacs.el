
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:
;; パッケージ
(when (require 'package nil t)
  (setq package-user-dir "f:/???/.emacs.d")
  (setq package-archives '(("gnu" .       "http://elpa.gnu.org/packages/")
                           ("marmalade" . "http://marmalade-repo.org/packages/")
                           ;;("melpa-stable" . "https://stable.melpa.org/packages/")
                           ;;("melpa2" .        "http://melpa.milkbox.net/packages/")
                           ("melpa" .     "http://melpa.org/packages/")))
  (package-initialize))
(setq inhibit-default-init t)
(setq package-check-signature nil) ;; sign の認証しない
;; (package-initialize)
;; (add-to-list 'package-archives '("melpa" . "http://melpa.org/packages/") t)
;; (package-refresh-contents) ;; キャッシュ作成
;; (package-list-packages) ;; パッケージのリスト表示

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:
;; しおりをつけるつけて、そこへジャンプする
(global-set-key [?\C-c?\C-\ ]				  'bm-toggle)	;しおりをつける ctrl+c ctrl+space
(define-key global-map [(control :)]	'bm-previous)	;前のしおりにジャンプ
(define-key global-map [(control \;)]	'bm-next)		;次のしおりにジャンプ

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; https://blog.takuchalle.dev/post/2018/05/07/emacs_symbol_highlight/
;;(package-install 'highlight-symbol)
;(require 'highlight-symbol);;kkk
;;; 1秒後自動ハイライトされるようになる
(setq highlight-symbol-idle-delay 1.0)
;;; 自動ハイライトをしたいならば
(add-hook 'prog-mode-hook 'highlight-symbol-mode)
;;; ソースコードにおいてM-p/M-nでシンボル間を移動
(add-hook 'prog-mode-hook 'highlight-symbol-nav-mode)
;;; シンボル置換
(global-set-key (kbd "M-s M-r") 'highlight-symbol-query-replace)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; <https://www.yokoweb.net/2017/06/23/msys2-emacs-ime-cursor/> ; kkk
;;
;; Windows IME設定
;;
;; tr-ime をネットインストールしておくこと ;kkk
(tr-ime-standard-install)
(setq default-input-method "W32-IME")
(setq-default w32-ime-mode-line-state-indicator "[--]")
(setq w32-ime-mode-line-state-indicator-list '("[--]" "[あ]" "[--]"))
(w32-ime-initialize)
;; 日本語入力時にカーソルの色を変える設定 (色は適宜変えてください)
(add-hook 'w32-ime-on-hook '(lambda () (set-cursor-color "coral3")))
(add-hook 'w32-ime-off-hook '(lambda () (set-cursor-color "orchid")))
;; IME 制御（yes/no などの入力の時に IME を off にする）
(wrap-function-to-control-ime 'universal-argument t nil)
(wrap-function-to-control-ime 'read-string nil nil)
(wrap-function-to-control-ime 'read-char nil nil)
(wrap-function-to-control-ime 'read-from-minibuffer nil nil)
(wrap-function-to-control-ime 'y-or-n-p nil nil)
(wrap-function-to-control-ime 'yes-or-no-p nil nil)
(wrap-function-to-control-ime 'map-y-or-n-p nil nil)
(wrap-function-to-control-ime 'register-read-with-preview nil nil)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; https://blog.tomoya.dev/posts/a-new-wave-has-arrived-at-emacs/
;; 新しい
;; 補完スタイルに orderless を利用する
(with-eval-after-load 'orderless (setq completion-styles '(orderless)))
(setq vertico-count 20) ;; 補完候補を最大20行まで表示する
;; vertico-mode と marginalia-mode を有効化する
(defun after-init-hook ()
  (vertico-mode)
  (marginalia-mode)
  ;; savehist-mode を使って Vertico の順番を永続化する
  (savehist-mode))
(add-hook 'after-init-hook #'after-init-hook)
;; embark-consult を読み込む
(with-eval-after-load 'consult
  (with-eval-after-load 'embark (require 'embark-consult)))
