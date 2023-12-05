;; -*- mode: emacs-lisp; coding: utf-8-unix -*-
;;  Time-stamp: "2023-12-05 22:27:47 kuramitu"
;; Copyright (C) 2001 The Meadow Team

;; パッケージ
;; proxy 環境なら環境変数 http-proxy の設定を行うこと
;; (package-list-packages)
(setq package-archives '(("gnu" .       "http://elpa.gnu.org/packages/")
                         ;;("marmalade" . "http://marmalade-repo.org/packages/")
                         ;;("melpa-stable" . "http://stable.melpa.org/packages/")
                         ;;("melpa2" .        "http://melpa.milkbox.net/packages/")
                         ("melpa" .     "http://melpa.org/packages/")))
(setq inhibit-default-init t)
(setq package-check-signature nil)

;; パッケージ情報の更新
(package-refresh-contents)
;; (package-list-packages)

;; インストールするパッケージ
(defvar my/favorite-packages
  '(rg color-moccur tr-ime embark-consult marginalia orderless vertico w32-ime yaml-mode bm web-mode highlight-indent-guides csharp-mode highlight-symbol browse-kill-ring company-terraform terraform-mode company undo-fu typescript-mode solidity-mode go-eldoc go-mode rjsx-mode color-theme xr vue-mode flycheck add-node-modules-path))
;; '(eg rg color-moccur tr-ime embark-consult marginalia orderless vertico w32-ime yaml-mode bm web-mode highlight-indent-guides csharp-mode highlight-symbol browse-kill-ring company-terraform terraform-mode company undo-fu typescript typescript-mode solidity-mode go-eldoc go-mode rjsx-mode color-theme xr vue-mode flycheck add-node-modules-path))

;; my/favorite-packagesからインストールしていないパッケージをインストール
(dolist (package my/favorite-packages)
  (unless (package-installed-p package)
    (package-install package)))

;; x
;; (package-install 'nodejs-repl)

;; https://www.grugrut.net/posts/my-emacs-init-el/
(setq debug-on-error t)

;; https://sci.nao.ac.jp/MEMBER/zenitani/elisp-j.html
;; Author: Koichiro Ohba <koichiro@meadowy.org>
;;      Kyotaro HORIGUCHI <horiguti@meadowy.org>
;;      Hideyuki SHIRAI <shirai@meadowy.org>
;;      KOSEKI Yoshinori <kose@meadowy.org>
;;      and The Meadow Team.

;; 
;;   /plink:kazuhiro@127.0.0.1#2122:~/ReactNativeSample
;;   /pscp:ubuntu@127.0.0.1#3122:~/ansble
;;   /plink:AWS:~
;;   /plink:AWS:~/ETH
;;   /plink:aws2:
;;   /pscp:vm1:~/ansble
;;   /plink:vm01:~/
;;   /plink:kazuhiro@127.0.0.1#2122:~/
;;   /pscp:kazuhiro@127.0.0.1#2122:/home/kazuhiro/aws-iot-device-sdk-embedded-c/samples/linux/subscribe_publish_sample
;;   /plink:vm1:~/ansble
;;   /plink:vm2:~/react-tutorial
;;   /plink:vm3:~
;;   /plink:ubuntu@127.0.0.1#3322:~/react-tutorial
;;   /plink:aws:
;;   /pscp:aws:
;;  /AWS:~

;; Windows の使うけど忘れるコマンドっぽいの
;; Chocolatey 
;; call refreshenv ;; 環境変数の即時反映

;; EC2 Windows インスタンスの時刻同期の問題
;; <https://aws.amazon.com/jp/premiumsupport/knowledge-center/ec2-windows-time-service/>
;;
;; Windows 10の時刻同期設定
;; <https://gato.intaa.net/archives/12107>
;;  $ sc triggerinfo w32time delete
;;  $ sc config w32time start= delayed-auto
;;  $ sc qc w32time
;;
;;  $ sc start w32time
;;  $ sc query w32time
;;
;;  同期先
;; $ w32tm /config /manualpeerlist:"192.168.0.1,0x9"
;; $ w32tm /config /syncfromflags:manual /update
;;
;; 複数のNTPサーバと同期 <https://cloudpack.media/10092>
;; $ w32tm /config /syncfromflags:manual /manualpeerlist:"0.amazon.pool.ntp.org 1.amazon.pool.ntp.org 2.amazon.pool.ntp.org 3.amazon.pool.ntp.org",0x8 /update /reliable:yes
;; 同期の確認
;; $ w32tm /resync

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defconst my:saved-file-name-handler-alist file-name-handler-alist)
(setq file-name-handler-alist nil)
(add-hook 'emacs-startup-hook
          (lambda ()
            (setq file-name-handler-alist my:saved-file-name-handler-alist)))
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defconst my:default-gc-cons-threshold gc-cons-threshold)
(setq gc-cons-threshold most-positive-fixnum)
;; Run GC every 60 seconds if emacs is idle.
(run-with-idle-timer 60.0 t #'garbage-collect)
(add-hook 'emacs-startup-hook
          (lambda ()
            (setq gc-cons-threshold my:default-gc-cons-threshold)))
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; Make sure that the bash executable can be found
(setq explicit-shell-file-name "~/git/usr/bin/bash.exe")
(setq shell-file-name explicit-shell-file-name)
(add-to-list 'exec-path "~/git/usr/bin")
;;(make-comint-in-buffer "cmd" nil "cmd" nil)

(setq find-dired-find-program "~/git/usr/bin/find.exe")
(setq find-program "~/git/usr/bin/find.exe")
;;(setenv "PATH" "C:\\Program Files\\Git\\usr\\bin")
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 
;; (toggle-debug-on-error)

(defun string-to-int (string &optional base) (floor (string-to-number string base)))
;; For css-mode, temporarily.
(defalias 'apropos-macrop 'macrop)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Windowsの設定
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;
;; Windowsパフォーマンスの調整
(when (boundp 'w32-pipe-read-delay)
  (setq w32-pipe-read-delay 0))

;; Windowsでバッファサイズを64Kに設定します（元の4Kから） 
(when (boundp 'w32-pipe-buffer-size)
  (setq irony-server-w32-pipe-buffer-size (* 64 1024)))

;; 「No such directory found via CDPATH environment variable」がでる

;; term側 cd 捕捉によるEmacs側の cd を抑制(term.elで定義されている関数)
;; (fset 'term-command-hook '(lambda (x)))
;; (add-hook 'shell-mode-hook 'ansi-color-for-comint-mode-on)

;; (setq append-path (list
;;                    "~/git/bin"
;;                    "~/git/usr/bin"
;;                    "~/git/mingw64/bin"
;;                    ))
;; (setq exec-path (append exec-path append-path))
;; (setq shell-file-name "bash")
;; (setenv "SHELL" shell-file-name)
;; (setq explicit-shell-file-name shell-file-name)
;;(setq append-path (list
;;                   “/bin”
;;                   “/usr/bin”
;;                   “/usr/local/bin”
;;                   “/sbin”
;;                   “/usr/sbin”
;;                   ))
;;(setq exec-path (append exec-path append-path))
;;(setenv “PATH” (mapconcat ‘identity exec-path ";"))
;;                              (setq shell-file-name “zsh”)
;;                              (setenv “SHELL” shell-file-name)
;;                              (setq explicit-shell-file-name shell-file-name)

;; Make sure that the bash executable can be found
;;(setq explicit-shell-file-name "~/git/usr/bin/bash.exe")
;;(setq shell-file-name explicit-shell-file-name)
;;(add-to-list 'exec-path "C:/Program Files/Git/usr/bin")

;; 環境変数の設定
(setenv "GTAGSLIBPATH" (concat "f:/yoshimaru/global/lib/"))
;;(setenv "HOME" "~")
(setenv "PATH" (concat
                "f:/yoshimaru/global/bin" ";"
                "c:/ProgramData/chocolatey/bin" ";"
                "~/git/bin"
                "~/git/usr/bin"
                "~/git/mingw64/bin"
                ))

;; home
;; HKCU\SOFTWARE\GNU\Emacs\HOME
;; (dolist (dir '("C:/Program Files/Git/usr/bin"
;;                "C:/Program Files/Git/cmd"
;;                ))
;;   (add-to-list 'exec-path dir))

;;; font-lockの設定
(global-font-lock-mode t)
(setq load-path (append '("~/elisp"
                          "~/velisp"
                          "f:/yoshimaru/apel"
                          "f:/yoshimaru/usr/mew"
                          "f:/yoshimaru/usr/lookup"
                          "f:/yoshimaru/usr/epo"
                          "f:/yoshimaru/usr/Ugdb"
                          ;;"~/.emacs.d/elisp/csharp-mode-20181011.718"
                          ) load-path))

(defun cygwin-shell ()
  "Run cygwin bash in shell mode."
  (interactive)
  (let ((explicit-shell-file-name "~/git/bin/bash.exe"))
    (call-interactively 'shell)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Emacs 共通設定
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;
;; Warning
;; enable-abbrev-complete
;; 

;;; どの el を使っているか確認
;; M-x locate-library RET cperl-mode RET
;; ‘lisp-complete-symbol’ is an obsolete command (as of 24.4); use ‘completion-at-point’ instead.
;; (load "/home/share/elisp/emacs.el")
;; (load "emacs-sys.el")
;; (require 'emacs)

;; (emacs-version) バージョン確認

;; .emacsがうまく動いているかのチェック。
;; (setq debug-on-error t);; *Backtrace*に結果が出力される。
;; (setq debug-on-error nil)

;; C-u C-0 M-x byte-recompile-directory
;;; elisp でエラーの時デバッグモードになる
;; (helpex-setup-keys)
;; (add-hook 'after-init-hook '(lambda () (setq debug-on-error t)))

;; HD が遅い場合
;; SSDにしたのでI/Oスケジューラを noop に変更してみた
;; <https://yohei-a.hatenablog.jp/entry/20131005/1380980124>
;; # echo cfq > /sys/block/sda/queue/scheduler
;; # cat /sys/block/sda/queue/scheduler
;; # fio -rw=randwrite -bs=4k -size=100m -directory=/tmp -direct=1 -numjobs=50 -name=file1 -ioengine=libaio -group_reporting

;; GTAGS の設定
;; global-6.6.3.tar.gz
;; > dd-hook 'after-init-hook '(lambda () (setq debug-on-error t)))

;; GTAGS の設定
;; /home/share/global-6.6.3.tar.gz
;;
;; > sudo apt install python-pip python3-pip exuberant-ctags libncurses5-dev sqlite3
;; > sudo pip install Pygments
;; > tar xf /home/share/global-6.6.3.tar.gz
;; > cd global-6.6.3
;; > ./configure
;; > make
;; > sudo make install

;; lsof -i
;; ss -t
;; netstat -t
;; ip r

;; - テーマの変更
;;    .bashrc
;;      export TERM=xterm-256color

;; - C++ 環境作成( Windowsだと cmake がない)
;; $ sudo apt install clang-8* cmake libclang-8-dev -y
;; $ emacs
;;   (package-list-packages)
;;   company
;;   irony
;;   company-irony-c-header
;;   yasnippet
;;  M-x irony-install-server
;;

;;A社 HDDのマシン 4CPU 4GB ( IPOS とか見る )
; fio -filename=/tmp/test2g -direct=1 -rw=read -bs=16k -size=2G -numjobs=64 -runtime=60 -group_reporting -name=file1

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* system
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;
;; 細かな設定
;;
;; C-k で一行を丸ごと消すときに、文末の改行も一緒に消す。
(setq kill-whole-line t)
;;タブ幅を 4 に設定
(setq-default tab-width 2)
;;タブ幅の倍数を設定
(setq tab-stop-list '(4 8 12 16 20 24 28 32 36 40 44 48 52 56 60 64 68 72 76 80 84 88))
;;; カーソルを点滅させない
(blink-cursor-mode 0)
;;; 前回編集していた場所を記憶
(load "saveplace")
;;(setq-default save-place t)
;(save-place-mode 1)
;;; 無駄な空行に気付きやすくする
(setq-default indicate-empty-lines t)
;;; isearch で大文字小文字を区別しない
(setq-default case-fold-search t)
 ;; 検索(全般)時には大文字小文字の区別をしない
(setq case-fold-search t)
;; インクリメンタルサーチ時には大文字小文字の区別をしない
(setq isearch-case-fold-search t)
;;; isearch のハイライトの反応をよくする
(setq lazy-highlight-initial-delay 0)
;;; 起動時の画面はいらない
(setq inhibit-startup-message t)
;;; メニューバーを非表示にする
;(menu-bar-mode -1)
(menu-bar-mode 0)
(put 'downcase-region 'disabled nil)
;(menu-bar-mode 1)
;;; ツールバーを表示しない
(tool-bar-mode 0)
;; スクロールバーを表示しない
(set-scroll-bar-mode nil)
;; 行番号を表示(Emacs26以降)
;; (global-display-line-numbers-mode t);; on
;; (global-display-line-numbers-mode 0);; off
;; (custom-set-variables '(display-line-numbers-width-start t))
;; native-compのワーニング抑制
(custom-set-variables
 ;; custom-set-variables was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 '(blink-cursor-mode nil)
 '(display-line-numbers-width-start t)
 '(eshell-ask-to-save-history 'always)
 '(eshell-cmpl-cycle-completions t)
 '(eshell-cmpl-cycle-cutoff-length 5)
 '(eshell-hist-ignoredups t)
 '(eshell-history-size 1000000)
 '(eshell-ls-dired-initial-args '("-h"))
 '(eshell-ls-exclude-regexp "~\\'")
 '(eshell-ls-initial-args "-h")
 '(eshell-prefer-to-shell t nil (eshell))
 '(eshell-stringify-t nil)
 '(eshell-term-name "ansi")
 '(eshell-visual-commands
   '("vi" "top" "screen" "less" "lynx" "ssh" "rlogin" "telnet"))
 '(package-selected-packages
   '(rg color-moccur tr-ime embark-consult marginalia orderless vertico w32-ime yaml-mode bm web-mode highlight-indent-guides csharp-mode highlight-symbol browse-kill-ring company-terraform terraform-mode company undo-fu typescript typescript-mode solidity-mode go-eldoc go-mode rjsx-mode color-theme xr vue-mode flycheck add-node-modules-path))
 '(safe-local-variable-values '((buffer-file-coding-system . emacs-mule)))
 '(show-paren-mode t)
 '(tab-width 2)
 '(terraform-indent-level 4)
 '(text-mode-hook '(turn-on-auto-fill text-mode-hook-identify))
 '(transient-mark-mode t)
 '(warning-suppress-log-types '((color-theme) (color-theme)))
 '(warning-suppress-types '((comp))))
;; オートインデントでスペースを使う
(setq-default indent-tabs-mode nil)
;; ハイライトインデントガイド(https://github.com/DarthFennec/highlight-indent-guides)
;;(require 'highlight-indent-guides);; kkk
(add-hook 'prog-mode-hook 'highlight-indent-guides-mode)

;; 警告音の代わりに画面フラッシュ
(setq visible-bell t)
;; 警告音もフラッシュも全て無効(警告音が完全に鳴らなくなるので注意)
(setq ring-bell-function 'ignore)

;; M-x customize-option <RET> tab-width

;; 時間表示
;;(setq display-time-mode nil)　;; 無効化したかったけど
;; isearch は occur で(いらない)
;;(defadvice isearch-update (after my-isearch-grep activate)
;;          (unless (string= isearch-string "")
;;          (occur isearch-string)))

;;; 最終更新日の自動挿入
;;; ファイルの先頭から 8 行以内に Time-stamp: <> または
;;; Time-stamp: " " と書いてあれば、セーブ時に自動的に日付が挿入されます
(if (not (memq 'time-stamp write-file-functions))
    (setq write-file-functions
          (cons 'time-stamp write-file-functions)))

;;; 改行キーで自動的にインデントしてほしい場合、変数 indent-line-function
;;; を設定し、改行キーのキーバインドを変更します。
;;(add-hook 'yahtml-mode-hook
;;    '(lambda ()
;;       (setq indent-line-function 'yahtml-indent-line)
;;       (define-key yahtml-mode-map "\C-m"
;;         'reindent-then-newline-and-indent)))

;;; CSS を編集するためのモードです
(autoload 'css-mode "css-mode")
(setq cssm-indent-level 2)
(setq cssm-indent-function #'cssm-c-style-indenter)
(setq auto-mode-alist (cons '("\\.css\\'" . css-mode) auto-mode-alist))

;;; リージョン内の文字を BS で消す
(delete-selection-mode 1)

;;; 不要時にはデフォルト値を表示しない
(minibuffer-electric-default-mode t)

;;; 同一名の buffer があったとき、開いているファイルのパスの
;;; 一部を表示して区別する
(when (locate-library "uniquify")
  (require 'uniquify)
  (setq uniquify-buffer-name-style 'post-forward-angle-brackets))

;;対応する括弧をハイライト
(show-paren-mode t)
(setq show-paren-style 'mixed)
;;(set-face-background 'show-paren-match-face "gray10")
;;(set-face-foreground 'show-paren-match-face "SkyBlue")
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; GDB 関連
;;(setq gdb-many-windows t) ;;; 有用なバッファを開くモード
;;(setq gdb-use-separate-io-buffer t) ;;; I/O バッファを表示
;;(setq gud-tooltip-echo-area nil) ;;; t にすると mini buffer に値が表示される

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;(custom-set-faces
;; '(hl-line ((t
;;             ;(:background "SteelBlue" :foreground "white")
;;             ;(:background "gray20" :foreground "white")
;;             ;((((class color)) (:background "#CC0066")))
;;             ((((class color)) (:background "#556B2F")));; 85 107 47 #556B2F
;;             ))))
;;             ;;(:background "gray20")
;;             ;;(:background "color-236")
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;(defvar global-hl-line-timer-exclude-modes '(todotxt-mode))
;;(defun global-hl-line-timer-function ()
;;  (unless (memq major-mode global-hl-line-timer-exclude-modes)
;;    (global-hl-line-unhighlight-all)
;;    (let ((global-hl-line-mode t))
;;      (global-hl-line-highlight))))
;;(setq global-hl-line-timer
;;            (run-with-idle-timer 0.03 t 'global-hl-line-timer-function))

;; バッファを切り替える と以前のバッファの色は消えます．
;; バッファを切り替えても色はついたままの状態にするには，以下を
(setq highlight-nonselected-windows t)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; タブ, 全角スペースを表示する
;;; 色は (list-colors-display) で調べられる
;;; M-x list-faces-display
;;; (list-faces-display)
;;; フェイス（文字の太さや下線などの属性）の一覧を表示する
;;(defface my-face-r-1 '((t (:background "gray15"))) nil)
(defface my-face-b-1 '((t (:background "gray"))) nil)
(defface my-face-b-2 '((t (:background "gray20"))) nil)
(defface my-face-u-1 '((t (:foreground "SteelBlue" :underline t))) nil)
;;(defvar my-face-r-1 'my-face-r-1)
(defvar my-face-b-1 'my-face-b-1)
(defvar my-face-b-2 'my-face-b-2)
(defvar my-face-u-1 'my-face-u-1)
(defadvice font-lock-mode (before my-font-lock-mode ())
  (font-lock-add-keywords
   major-mode
   '(("\t" 0 my-face-b-2 append)
     ("　" 0 my-face-b-1 append)
     ("[ \t]+$" 0 my-face-u-1 append)
     ;;     ("[\r]*\n" 0 my-face-r-1 append)
     )))
(ad-enable-advice 'font-lock-mode 'before 'my-font-lock-mode)
(ad-activate 'font-lock-mode)
;;              ;　　　         

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* key
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 文字をデカく
;; C-x C-+
;;
;; 文字を小さく
;; C-x C--

;; 使えそうなキーバインドを開放しておく
(global-unset-key "\C-j")
                                        ;(global-unset-key "\C-u")
(global-unset-key "\C-@")
(global-unset-key "\C-c@")
(global-unset-key "\C-\\")
(global-unset-key "\C-cp")

;;(define-key global-map "\ey"  'kill-summary)  ; yank のリスト表示
(global-set-key (kbd "C-c y") 'browse-kill-ring);
;;(define-key global-map "\C-z" 'kill-ring-save); 選択範囲をコピー

;;文字列補完
;;(global-set-key "\C-^"		'expand-abbrev) ;;文字列補完
(define-key lisp-mode-map               "\C-^"	'completion-at-point)
(define-key lisp-interaction-mode-map   "\C-^"	'completion-at-point)
(define-key emacs-lisp-mode-map         "\C-^"	'completion-at-point)
;;(define-key lisp-mode-map             "\C-^"	'lisp-complete-symbol)
;;(define-key lisp-interaction-mode-map	"\C-^"	'lisp-complete-symbol)
;;(define-key emacs-lisp-mode-map       "\C-^"	'lisp-complete-symbol)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;
(setq-default case-fold-search      nil
              truncate-partial-width-windows    nil
              fill-column           70)


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; Ubuntu
;; <https://qiita.com/yoshizow/items/9cc0236ac0249e0638ff>
;; $ sudo apt install -y python3.7 python3-pip
;; $ sudo apt install -y python3-pip
;; $ cd /usr/bin ; ln -s python3 python
;;   python3-pip は 3.6 で動作するので python3.6 のシンボリックリンクだと module 読めなくなる
;; $ sudo apt install -y python-apt
;; $ sudo pip3 install Pygments
;; $ sudo apt install -y exuberant-ctags
;; ... gtags のビルドしなおし？ ...

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Emacs で JavaScript コーディングを快適に
(setq js-mode-hook '(lambda ()(gtags-mode 1)))
;; <https://qiita.com/ybiquitous/items/22ca5b8335fdf71967e8>
;;(add-hook 'js-mode-hook #'js-auto-format-mode)
;;(add-hook 'js-mode-hook #'add-node-modules-path)
;;(setq tags-table-list '("~/TAGS" ))

;; for json format
(defun jq-format (beg end)
  (interactive "r")
  (shell-command-on-region beg end "jq-win64.exe ." nil t))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Go言語( golang ) の設定
;; <https://emacs-jp.github.io/programming/golang>
;; go-mode
;; go-autocomplete or company-go
;; go-eldoc
;;(with-eval-after-load 'go-mode

;; auto-complete
;;(require 'go-autocomplete)

;; company-mode
;;(add-to-list 'company-backends 'company-go)

;; eldoc
;;  (add-hook 'go-mode-hook 'go-eldoc-setup)

;; key bindings
;;  (define-key go-mode-map (kbd "M-.") 'godef-jump)
;;  (define-key go-mode-map (kbd "M-,") 'pop-tag-mark))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(global-set-key "\C-x\C-b"	'bs-show) ; C-xC-bでのバッファスイッチが簡単にできる
(global-set-key "\C-o"			'(lambda ()
								               "scroll-up one line"
								               (interactive)
								               (scroll-up 1)))
(global-set-key "\C-t"			'(lambda ()
								               "scroll-down one line"
								               (interactive)
								               (scroll-down 1)))

;; C-h と Del の入れ替え
;; Help が Shift + Ctrl + h および Del に割当てられ、
;; 前一文字削除が Ctrl + h に割当てられます
(keyboard-translate ?\C-h ?\C-?)

;;; f1 でヘルプが見られる
(global-set-key [f1] 'help-for-help)

;;関数定義へジャンプ
(global-set-key "\C-ci"		'imenu)
(global-set-key "\C-cb"		'background)
(global-set-key "\C-cg"		'garbage-collect)
(global-set-key "\C-ch"		'hexl-find-file)
(global-set-key "\C-cj"		'gdb)
(global-set-key "\C-ck"		'compile)
;; カレントバッファの名前を変更する
(global-set-key "\C-cnm"	'rename-buffer)
(global-set-key "\C-cq"		'save-buffers-kill-emacs)
(global-set-key "\C-csh"	'eshell)
;; mode-info 関連
(global-set-key "\C-cf"		'mode-info-describe-function)	; 関数ヘルプを出す
(global-set-key "\C-c."		'mode-info-find-tag)			; 関数の実態の場所を出す
(global-set-key "\C-cv"		'mode-info-describe-variable)	; 変数定義箇所を出す
;; 二つのファイルを比較して同じ所まで移動する。
(global-set-key "\C-cw"		'compare-windows)

;;(global-set-key "\C-c\C-f"		'find-dired); EmacsのFind-Dired は意外と便利
;;(global-set-key "\C-c\C-f"		'rgrep); EmacsのFind-Dired は意外と便利
;; rg ( choco install ripgrep );
;;(global-set-key "\C-c\C-f"		'rg)
;;(rg-enable-default-bindings)

;; `find-grep-dired' case insensitivity.
;;(setq find-grep-options "-i -q")

(global-set-key "\C-x\C-l"		'call-navi)
(global-set-key "\C-x\C-p"		'kmacro-end-and-call-macro)	;キーボード
                                        ;マクロの開
                                        ;始
(global-set-key "\C-x\C-q"		'toggle-read-only)
(global-set-key "\C-x\C-o"		'other-window)

;; カレントバッファのファイルをバイトコンパイル
(defun byte-compile-this-file ()
  "compile current-buffer-file of lisp into a file of byte code."
  (interactive)
  (byte-compile-file buffer-file-name t))
(global-set-key "\C-jbc"			  'byte-compile-this-file)

;; ファイルの文字コード変換
(global-set-key "\C-jnm"	 'set-buffer-file-coding-system)

(global-set-key "\C-jdf"	 'find-grep-dired) ;
(global-set-key "\C-jf"	 'grep-find) ;
(global-set-key "\C-jdg"	 'igrep)	  ;

(global-set-key "\C-jcc"	 'calculator) ; 電卓
(global-set-key "\C-jcr"	 'calendar)	  ; カレンダー

(global-set-key "\C-jj"	  'goto-line);;

;; 行が画面からはみ出した場合改行して表示するか、表示しないか
(global-set-key "\C-jg"
			          '(lambda ()
			             "toggle truncate-lines or not truncate-lines"
			             (interactive)
			             (setq truncate-lines (not truncate-lines))
			             (redraw-display)))

;;バッファに移動したければ，Shift+ 上カーソルキーとする だけで移動できます．
(windmove-default-keybindings)

;; やり直し redo
;;(require 'redo)
;;(global-set-key "\C-\\"					'redo)
(global-set-key (kbd "C-\\")   'undo-fu-only-undo);; undo-fu

;; すべてのバッファを全文検索．検索語はスペースで区切る

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; isearch の検索語を 1 文字ずつ消す
(defun isearch-real-delete-char ()
  (interactive)
  (setq isearch-string
		    (if (= (length isearch-string) 1)
			      isearch-string
		      (substring isearch-string 0 (- (length isearch-string) 1)))
		    isearch-message isearch-string
		    isearch-yank-flag t)
  (isearch-search-and-update))
(define-key isearch-mode-map "\C-o" 'isearch-real-delete-char)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* Emacs から Node.js
;;  emacsのReactの開発をrjsx-modeで行う <https://joppot.info/2017/04/07/3734>
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(add-to-list 'auto-mode-alist '(".*\\.js\\'" . rjsx-mode))
(add-to-list 'auto-mode-alist '(".*\\.mjs\\'" . rjsx-mode))
(add-hook 'rjsx-mode-hook
          (lambda ()
            (setq indent-tabs-mode nil)                  ;; インデントはタブではなくスペース
            (setq js-indent-level 2)                     ;; スペースは２つ、デフォルトは4
            (setq js2-strict-missing-semi-warning nil)   ;; 行末のセミコロンの警告はオフ
            ))
;; (add-hook 'js-mode-hook
;;           (lambda ()
;;             (make-local-variable 'js-indent-level)
;;             (setq js-indent-level 2)))

;; バッチファイルや.INIファイルのモード
(autoload 'generic-x "bat" "bat-generic-mode" t)
(require 'generic-x)

;; バッチファイル用のモード (bat-generic-mode)
;; .INI ファイル用のモード (ini-generic-mode) が追加されます。

(add-to-list 'auto-mode-alist '("\\.ts[x]?\\'" . web-mode))
(setq web-mode-markup-indent-offset 2)
(setq web-mode-css-indent-offset 2)
(setq web-mode-code-indent-offset 2)

;; HTML
;;(autoload 'html-helper-mode "html-helper-mode" "Yay HTML" t)
;;(setq auto-mode-alist (cons '("\\.html$" . html-helper-mode) auto-mode-alist))
(setq auto-mode-alist (cons '("\\.html$" . vue-html-mode) auto-mode-alist))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* Emacs のバックアップディレクトリ指定
;;  backup
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(setq *backup-directory* "~/Cache")
(cond ((not (fboundp 'make-backup-file-name-original))
       (fset 'make-backup-file-name-original
             (symbol-function 'make-backup-file-name))
       (defun make-backup-file-name (filename)
         (let ((backup-directory-path (concat *backup-directory* "/")))
           (if (and (file-exists-p (expand-file-name *backup-directory*))
                    (file-directory-p
                     (expand-file-name backup-directory-path)))
               (expand-file-name
                (make-backup-file-name-original
                 (file-name-nondirectory filename)) backup-directory-path)
             (make-backup-file-name-original filename))))))

;;(recentf-mode 1)
;; M-x recentf-open-files でも最近使ったファイルの一覧を表示することが
;; で きます．一覧が表示されたら，ファイルを選んで RET でそのファイルを
;; 開くこと ができます．
;;(recentf-open-files)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* dired 関連
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; icomplete-mode
;; , . で選択切り替え
(icomplete-mode 99)
;;(ido-mode 99) ;; これは使いにくい
;;(setq icomplete-buffer-ignore
;;      '(
;;        "*twittering-wget-buffer*"
;;        "*twittering-http-buffer*"
;;        "*WoMan-Log*"
;;       "*SKK annotation*"
;;       "*Completions*"
;;        ))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* Eshellを使いこなす
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;;(require 'eshell-auto)
;; WINDOW SCROLL TO BOTTOM
;; by ZwaX
;;
;; ;; eshell のプロンプトの変更
;; (setq eshell-prompt-function 'eshell-prompt)
;; (defun eshell-prompt () " # " )
;; ;;eshell-previous-input
;; (defun eshell-scroll-to-bottom (window display-start)
;;   (if (and window (window-live-p window))
;;       (let ((resize-mini-windows nil))
;;         (save-selected-window
;;           (select-window window)
;;           (save-restriction
;;             (widen)
;;             (when (> (point) eshell-last-output-start)
;;               ;;we're editing
;;               ;;a line. Scroll.
;;               (save-excursion
;;                 (recenter -1))))))))
;; (defun eshell-add-scroll-to-bottom ()
;;   (interactive)
;;   (add-hook 'window-scroll-functions 'eshell-scroll-to-bottom nil t))
;; (setq eshell-output-filter-functions
;; 	  (quote (eshell-handle-control-codes
;; 			  eshell-watch-for-password-prompt
;; 			  eshell-postoutput-scroll-to-bottom)))
;; ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; ;;;eshellのキー設定
;; (global-set-key "\C-ce" 'shell-toggle)
;; ;;最初は画面の半分で起動もう一回eshell-toggleしたら全画面になる
;; ;;が、2度目のトグル前になんらかの入力があった場合は2度目のトグルで消えてくれる
;; (add-hook 'eshell-mode-hook (lambda ()
;;                               (define-key eshell-mode-map "\C-d" 'backward-kill-word)))
;; (add-hook 'eshell-mode-hook (lambda ()
;;                               (define-key eshell-mode-map "\C-a" 'eshell-bol)))

;; (autoload 'shell-toggle "shell-toggle"
;;   "Toggles between the *shell* buffer and whatever buffer you are editing."
;;   t)
;; (autoload 'shell-toggle-cd "shell-toggle"
;;   "Pops up a shell-buffer and insert a \"cd \" command." t)

;; ;;デフォだとC-aで行の先頭までいってまうけど
;; ;;これでプロンプト前にいく
;; ;;(setq eshell-cmpl-ignore-case t)

;; ;;バックグラウンドでコマンドを実行させることができる．コマンドの終了まで待つ必要が なくなる
;; (global-set-key "\M-!" 'background)
;; (autoload 'background "background" nil t)

;;shell のコマンド履歴から先頭の文字をもとに補完できる
                                        ;(define-key comint-mode-map [?\M-p] 'comint-previous-matching-input-from-input)
                                        ;(define-key comint-mode-map [?\M-n] 'comint-next-matching-input-from-input)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; NodeJS
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;(autoload 'nodejs-repl "nodejs-repl" "Run Node.js REPL" t)
;;(setq nodejs-repl-prompt "node> ")

;; Emacs で vue-mode + flycheck + eslint による動的構文チェック
;; <https://qiita.com/ororog/items/ac91106000a7c4c19d65>
;;(require 'flycheck)
;; (eval-after-load 'vue-mode
;;  '(add-hook 'vue-mode-hook #'add-node-modules-path))
;; (flycheck-add-mode 'javascript-eslint 'vue-mode)
;; (flycheck-add-mode 'javascript-eslint 'vue-html-mode)
;; (flycheck-add-mode 'javascript-eslint 'css-mode)
;; (add-hook 'vue-mode-hook 'flycheck-mode)

;; Emacsでreact+es6に対応したflycheck + eslintの環境を構築する
;;  <https://joppot.info/2017/04/12/3777>

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:
;; しおりをつけるつけて、そこへジャンプする
(global-set-key [?\C-c?\C-\ ]				  'bm-toggle)	;しおりをつける ctrl+c ctrl+space
(define-key global-map [(control :)]	'bm-previous)	;前のしおりにジャンプ
(define-key global-map [(control \;)]	'bm-next)		;次のしおりにジャンプ

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; etags
;; M-.	関数の定義箇所へ
;; M-*	前に戻る
;; C-x 4 .	関数の定義を別ウィンドウに表示
;; C-u M-.	同名の定義の次の箇所へ
;; C-u M-*	同名の定義の前に戻る
;; M-x list-tags	関数の一覧を表示
;; M-x tags-search	タグファイルに登録されているすべてのファイルに対してタグジャンプ
;; M-x visit-tags-table	TAGSファイルの切り替え
;; M-x tags-apropos	正規表現に一致した関数のみ表示
;; M-x tags-reset-tags-tables	タグファイルの情報をリセット
;; M-x tags-query-replace	タグファイルに登録されているすべてのファイルに対して置換が行える。
;;tags-query-replaceのコマンド
;; キー	機能
;; y	置換を実行し、次の候補へ移動する
;; n	置換を実行せず、次の候補へ移動する
;; q or RET	置換を実行せず、次の候補に移動せず終了
;; .	置換を実行して、次の候補に移動せず終了  

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; <https://dev.classmethod.jp/devenv/emacs-edit-yaml-cloudformation/>
;; EmacsでCloudFormationテンプレート(YAML)を編集する
;; (require 'yaml-mode)
;; (add-to-list 'auto-mode-alist '("\\.yml\\'" . yaml-mode))
;; (add-to-list 'auto-mode-alist '("\\.yaml\\'" . yaml-mode))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Windows 環境の Emacs でマークダウンモード
;;  <https://qiita.com/umeneri/items/8824907d50e3108481b3> 
;;  <https://jblevins.org/projects/markdown-mode/>
;; GNU Emacs25.3/etc/DEBUGの翻訳
;;  <https://qiita.com/ayatakesi/items/e399f530ed1090508d0c>
;; markdown-mode
;;(autoload 'markdown-mode "markdown-mode" "Major mode for editing Markdown files" t)
;;(add-to-list 'auto-mode-alist '("\\.txt\\'" . markdown-mode))
;;(add-to-list 'auto-mode-alist '("\\.markdown\\'" . markdown-mode))
;;(add-to-list 'auto-mode-alist '("\\.md\\'" . markdown-mode))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; 補完
;; (company-mode)
;(require 'company)
(global-company-mode) ; 全バッファで有効にする ;;kkk

(with-eval-after-load 'company
  (setq company-auto-expand t) ;; 1個目を自動的に補完
  (setq company-transformers '(company-sort-by-backend-importance)) ;; ソート順
  (setq company-selection-wrap-around t) ; 候補の最後の次は先頭に戻る
  (setq completion-ignore-case t)
  (setq company-dabbrev-downcase nil)
  (global-set-key (kbd "C-M-i") 'company-complete)
  (define-key company-active-map (kbd "C-n") 'company-select-next);; C-n, C-pで補完候補を次/前の候補を選択
  (define-key company-active-map (kbd "C-p") 'company-select-previous)
  ;;(define-key company-active-map [tab] 'company-complete-selection) ;; TABで候補を設定
  (define-key company-active-map [tab] nil) ;; TABで候補を設定しない
  (define-key company-active-map (kbd "C-h") nil) ;; C-hはバックスペース割当のため無効化
  (define-key company-active-map (kbd "C-S-h") 'company-show-doc-buffer) ;; ドキュメント表示はC-Shift-h
  
  (set-face-attribute 'company-tooltip nil
                      :foreground "black" :background "lightgrey")
  (set-face-attribute 'company-tooltip-common nil
                      :foreground "black" :background "lightgrey")
  (set-face-attribute 'company-tooltip-common-selection nil
                      :foreground "white" :background "steelblue")
  (set-face-attribute 'company-tooltip-selection nil
                      :foreground "black" :background "steelblue")
  (set-face-attribute 'company-preview-common nil
                      :background nil :foreground "lightgrey" :underline t)
  (set-face-attribute 'company-scrollbar-fg nil
                      :background "orange")
  (set-face-attribute 'company-scrollbar-bg nil
                      :background "gray40")

  (setq company-backends
        '(company-ispell
          company-yasnippet
          (company-dabbrev-code company-gtags company-keywords) 
          ;; grouping分らん、 withとかなんとか
          ;; company-keywords    ;; keywords by company default
          ;; company-bbdb        ;; database for mail address......
          ;; company-etags       ;; TAGS ファイルの追加とかうざい POPUP がでる
          company-gtags          ;; あまり使用感がない？
          company-files          ;; files & directory
          company-capf           ;; completion-at-point-functions
                                        ;company-dabbrev-code  ;; dabbrev for code
                                        ;company-oddmuse   ;; WikiWiki engine Oddmuse such as emacswiki.org
                                        ;company-abbrev    ;; 静的略称展開
          company-dabbrev    ;; 動的略称展開
          
          company-c-headers  ;; C言語のヘッダ設定
          )))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; C++ 設定
;; ホックを使った設定
(defun my-c-c++-mode-init ()
  (setq c-basic-offset 2)
  (setq indent-tabs-mode nil)
  '(lambda ()(gtags-mode 1))
  )
(add-hook 'c-mode-hook 'my-c-c++-mode-init)
(add-hook 'c++-mode-hook 'my-c-c++-mode-init)

;;; 補完候補をプロジェクト内から取得するためには，
;;; .dir-locals.el をプロジェクトルートに配置する必要がある．
;;((nil . ((company-clang-arguments
;;          . ("-I/home/<user>/project_root/include1/"
;;             "-I/home/<user>/project_root/include2/")
;;          ))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; C# support
(autoload 'csharp-mode "csharp-mode" "Major mode for editing C# code." t)
(setq auto-mode-alist (cons '("\\.cs$" . csharp-mode) auto-mode-alist))
;; Patterns for finding Microsoft C# compiler error messages:
                                        ;(require 'csharp-mode);;kkk
(require 'compile)
(push '("^\\(.*\\)(\\([0-9]+\\),\\([0-9]+\\)): error" 1 2 3 2) compilation-error-regexp-alist)
(push '("^\\(.*\\)(\\([0-9]+\\),\\([0-9]+\\)): warning" 1 2 3 1) compilation-error-regexp-alist)

;; Patterns for defining blocks to hide/show:
(push '(csharp-mode
        "\\(^\\s *#\\s *region\\b\\)\\|{"
        "\\(^\\s *#\\s *endregion\\b\\)\\|}"
        "/[*/]"
        nil
        hs-c-like-adjust-block-beginning)
      hs-special-modes-alist)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Python
(require 'python)

;; 閉じカッコの補完
(add-hook 'python-mode-hook
          (lambda ()
            (define-key python-mode-map "\"" 'electric-pair)
            (define-key python-mode-map "\'" 'electric-pair)
            (define-key python-mode-map "(" 'electric-pair)
            (define-key python-mode-map "[" 'electric-pair)
            (define-key python-mode-map "{" 'electric-pair)))
(defun electric-pair ()
  "Insert character pair without sournding spaces"
  (interactive)
  (let (parens-require-spaces)
    (insert-pair)))

;; 改行時のオードインデント
(add-hook 'python-mode-hook '(lambda () 
                               (define-key python-mode-map "\C-m" 'newline-and-indent)))

;; インデント幅
;;(setq-default indent-tabs-mode nil)
;;(setq-default tab-width 2)
;; (setq python-indent-offset 4)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; PowerShell モード
;; <http://hhsprings.pinoko.jp/site-hhs/2015/03/父さんは酸素欠乏症powershell-el/>
;;(defcustom powershell-location-of-exe
;;  "c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe"
;;  "A string, providing the location of the Powershell.exe."
;;  :group 'powershell)
;; powershell-mode
(autoload 'powershell-mode
  "powershell" "A editing mode for Microsoft PowerShell." t)
(add-to-list 'auto-mode-alist
             '("\\.ps1\\'" . powershell-mode)) ; PowerShell script

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 現在行をハイライト
;; <http://keisanbutsuriya.hateblo.jp/entry/2015/02/01/162035>
;;(global-hl-line-mode t)
;; (customize-face)

;; change highlight color
;;(custom-set-faces

;; custom-set-faces was added by Custom.
;; If you edit it by hand, you could mess it up, so be careful.
;; Your init file should contain only one such instance.
;; If there is more than one, they won't work right.
;; '(highlight ((((class color)) (:background "#660000"))))
;; '(lazy-highlight ((default (:background "SteelBlue" :foreground "white")))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; .emacs.d 以下の .el ファイルを全てコンパイルする関数を作る
;; <https://qiita.com/biwakonbu/items/d30d40476d1c7e4eb78f>
(defun core/all-elisp-byte-compile ()
  (interactive)
  (let ((elisp-paths
         (split-string
          (shell-command-to-string "find $HOME/.emacs.d/ -name '*.el'")
          )))
    (dolist (elisp-path elisp-paths)
      (byte-compile-file elisp-path)
      (message "compiled %s file." elisp-path))))
;; (core/all-elisp-byte-compile)

;; ライブラリのコンパイルなど
;; <http://flex.phys.tohoku.ac.jp/texi/emacs-jp/emacs-jp_162.html>
;; emacs -batch -f batch-byte-compile files...

;; fnwiya's quine
;; <http://fnwiya.hatenablog.com/entry/2015/09/29/233920>
;; ("~/.emacs.d/loader-init" の部分は自分の設定ファイルが置いてあるところに読み替えてください。)
;;(byte-recompile-directory (expand-file-name "~/.emacs.d/loader-init") 0)
;;(byte-recompile-directory (expand-file-name "/home/share/elisp") 0)

;; auto-async-byte-compileをインストールして(melpaにあります)設定ファイルに以下のコードを追加
;;(require 'auto-async-byte-compile)
;;(add-hook 'emacs-lisp-mode-hook 'enable-auto-async-byte-compile-mode)

;; これでファイルを保存したときにバイトコンパイルしなおしてくれます。
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(setq explicit-shell-file-name "f:/usr/bin/bash.exe")
(setq shell-file-name "f:/usr/bin/bash.exe")

(require 'tramp)
(setq recentf-auto-cleanup 'never)
(setq tramp-default-method "psftp")
(tramp-cleanup-this-connection)

;; ドライブレターの後の「：」が tramp-method の後の「：」と混同されるのを対策する
(advice-add 'tramp-do-copy-or-rename-file-out-of-band
            :around (lambda (orig-fun &rest args)
                      (let ((default-directory "/"))
                        (dolist (pos '(1 2))
                          (unless (tramp-tramp-file-p (nth pos args))
                            (setf (nth pos args)
                                  (substring (shell-command-to-string
                                              (concat "cygpath -u "
                                                      (shell-quote-argument (nth pos args))))
                                             0 -1)))))
                      (apply orig-fun args)))

;; Define a new tramp method name to avoid the conflict of
;; default version of 'plink'

(add-to-list 'tramp-methods
             (list "aws"
                   '(tramp-login-program "plink")
                   (cons 'tramp-login-args
                         (list (list 
                                '("-l" "ubuntu")
                                '("-P" "22")
                                '("-ssh")
                                '("-t")
                                '("-a")
                                '("-x")
                                '("-i" "~/.ssh/KAZU_rsa.ppk")
                                '("3.112.234.41")
                                '("\"")
                                '("env 'TERM=dumb' 'PROMPT_COMMAND=' 'PS1=#$ '")
                                '("/bin/sh")
                                '("\"")
                                )))
                   '(tramp-remote-shell "/bin/sh")
                   '(tramp-remote-shell-login ("-l" "ubuntu"))
                   '(tramp-remote-shell-args ("-c"))
                   '(tramp-copy-program nil)
                   '(tramp-copy-args nil)
                   '(tramp-copy-keep-date nil)
                   ))
(add-to-list 'tramp-methods
             (list "vm1"
                   '(tramp-login-program "plink")
                   (cons 'tramp-login-args
                         (list (list 
                                '("-l" "ubuntu")
                                '("-P" "3122")
                                '("-ssh")
                                '("-t")
                                '("-a")
                                '("-x")
                                '("-i" "~/.ssh/KAZU_rsa.ppk")
                                '("127.0.0.1")
                                '("\"")
                                '("env 'TERM=dumb' 'PROMPT_COMMAND=' 'PS1=#$ '")
                                '("/bin/sh")
                                '("\"")
                                )))
                   '(tramp-remote-shell "/bin/sh")
                   '(tramp-remote-shell-login ("-l" "ubuntu"))
                   '(tramp-remote-shell-args ("-c"))
                   '(tramp-copy-program nil)
                   '(tramp-copy-args nil)
                   '(tramp-copy-keep-date nil)
                   ))
(add-to-list 'tramp-methods
             (list "vmt01"
                   '(tramp-login-program "plink")
                   (cons 'tramp-login-args
                         (list (list 
                                '("-l" "ubuntu")
                                '("-P" "3122")
                                '("-ssh")
                                '("-t")
                                '("-a")
                                '("-x")
                                '("-i" "~/.ssh/KAZU_rsa.ppk")
                                '("127.0.0.1")
                                '("\"")
                                '("env 'TERM=dumb' 'PROMPT_COMMAND=' 'PS1=#$ '")
                                '("/bin/sh")
                                '("\"")
                                )))
                   '(tramp-remote-shell "/bin/sh")
                   '(tramp-remote-shell-login ("-l" "ubuntu"))
                   '(tramp-remote-shell-args ("-c"))
                   '(tramp-copy-program nil)
                   '(tramp-copy-args nil)
                   '(tramp-copy-keep-date nil)
                   ))


;; tramp backup path (if not set, save in local backup directory)
(setq tramp-backup-directory-alist nil)
(setq tramp-auto-save-directory nil)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; <https://www.yokoweb.net/2017/06/23/msys2-emacs-ime-cursor/>
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

;; yes-no を答えるとき IME を OFF にする
(defalias 'yes-or-no-p 'y-or-n-p)
(setq isearch-lazy-highlight t)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; dired でサブディレクトリも削除やコピー
(setq dired-recursive-copies 'always)
(setq dired-recursive-deletes 'always)

;; dired から関連付けられたソフトで開く
(add-hook 'dired-mode-hook
          (lambda () (define-key dired-mode-map "z" 'dired-fiber-find)))
(defun dired-fiber-find ()
  (interactive)
  (let ((file (dired-get-filename)))
	  (w32-shell-execute "open" file)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; dired をより便利に使うための設定
;; <https://w.atwiki.jp/ntemacs/pages/79.html>
(require 'dired)
(require 'wdired)

;; ディレクトリの再帰的コピーを問い合わせ無く行う
(setq dired-recursive-copies 'always)

;; Dired を 2つのウィンドウで開いているときに other-window へ copy する
(defun dired-do-copy-dwim ()
  (interactive)
  (let ((dired-dwim-target t)) (dired-do-copy)))

;; Dired を 2つのウィンドウで開いているときに other-window へ move する
(defun dired-do-rename-dwim ()
  (interactive)
  (let ((dired-dwim-target t)) (dired-do-rename)))

;; Dired を 2つのウィンドウで開いているときに other-window へ symlink する
(defun dired-do-symlink-dwim ()
  (interactive)
  (let ((dired-dwim-target t)) (dired-do-symlink)))

;; キー割り当て
;; https://www.7key.jp/software/dired.html
(define-key dired-mode-map (kbd "c") 'dired-do-copy-dwim)
(define-key dired-mode-map (kbd "r") 'dired-do-rename-dwim)
(define-key dired-mode-map (kbd "s") 'dired-do-symlink-dwim)
(define-key dired-mode-map (kbd "e") 'wdired-change-to-wdired-mode)

;; 見た目
(require 'ls-lisp)
(setq ls-lisp-use-localized-time-format t)
(setq ls-lisp-format-time-list (quote ("%Y/%m/%d %H:%M" "%Y/%m/%d %H:%M")))
(setq ls-lisp-use-insert-directory-program nil)
(setq ls-lisp-verbosity nil)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;* desktop
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(require 'desktop)
;;(desktop-load-default);; デフォルトファイル表示一覧

;;; 前回起動情報の保存 <http://lioon.net/emacs-desktop>

;; 1.保存された最新の状態に戻します。                 ;;; (desktop-revert)
;; 2.現在、使用されているディレクトリへ上書きします。 ;;; desktop-save-in-desktop-dir
;; 3.保存先のディレクトリを変更して内容を復元します。 ;;; desktop-change-dir
;; desktop-remove
;; desktop-clear
;; (desktop-save)

(setq desktop-change-dir "~/.emacs.d")
;; (desktop-read)
; (desktop-save-in-desktop-dir)
;; (desktop-clear)

(desktop-save-mode t)
(setq desktop-enable t)
;(put 'upcase-region 'disabled nil)

;; 保存しないファイルの正規表現
(setq desktop-files-not-to-save "\\(^/[^/:]*:\\|\\.diary$\\)")
;(autoload 'desktop-save			"desktop" nil t)
;(autoload 'desktop-clear		"desktop" nil t)
;(autoload 'desktop-load-default "desktop" nil t)
;(autoload 'desktop-remove		"desktop" nil t)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; GTAGS
(autoload 'gtags-mode "gtags" "" t)
(setq gtags-mode-hook
    '(lambda ()
        (local-set-key "\M-t" 'gtags-find-tag)    ;関数へジャンプ
        (local-set-key "\M-r" 'gtags-find-rtag)   ;関数の参照元へジャンプ
        (local-set-key "\M-s" 'gtags-find-symbol) ;変数の定義元/参照先へジャンプ
        (local-set-key (kbd "C-,") 'gtags-pop-stack)   ;前のバッファに戻る
        ))
;;(setq c-mode-hook '(lambda ()(gtags-mode 1)))
(add-hook 'c-mode-hook
          '(lambda()
            (hs-minor-mode 1)))
(setq c-mode-hook '(lambda ()(gtags-mode 1)))
(setq c++-mode-hook '(lambda ()(gtags-mode 1)))
(setq java-mode-hook '(lambda ()(gtags-mode 1)))
(setq solidity-mode '(lambda ()(gtags-mode 1)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; 表示内容を無くす、もしくは、縮小すする
(add-hook 'isearch-mode-hook          ;; Isearch は表示しなくてよい
          '(lambda () (setcar (cdr (assq 'isearch-mode minor-mode-alist)) "")))
(add-hook 'lisp-interaction-mode-hook ;; scratch バッファの Lisp Interaction も長い
          '(lambda () (setq mode-name "Lsp-Int")))
(add-hook 'emacs-lisp-mode-hook       ;; Emacs-Lisp も長い
          '(lambda () (setq mode-name "Elsp")))
(add-hook 'rjsx-mode-hook               ;; Javaascript も長い
          '(lambda () (setq mode-name "RJScpt")))
(add-hook 'js-mode-hook               ;; Javaascript も長い
          '(lambda () (setq mode-name "JScpt")))
(add-hook 'typescript-mode-hook
          '(lambda () (setq mode-name "TScpt")))
(add-hook 'company-hook               ;; Company も長い
          '(lambda () (setq mode-name "Cmpny")))
(add-hook 'solidity-mode
          '(lambda () (setq mode-name "SOL")))
(add-hook 'gtags-mode
          '(lambda () (setq mode-name "gTAG")))
(add-hook 'global-company-mode
          '(lambda () (setq mode-name "cmpy")))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; eshell で cd すると、CDPATH がエラーになるので対応
;; 「No such directory found via CDPATH environment variable」
(defun cd (dir)
  "Make DIR become the current buffer's default directory.
If your environment includes a `CDPATH' variable, try each one of
that list of directories (separated by occurrences of
`path-separator') when resolving a relative directory name.
The path separator is colon in GNU and GNU-like systems."
  (interactive
   (list
    ;; FIXME: There's a subtle bug in the completion below.  Seems linked
    ;; to a fundamental difficulty of implementing `predicate' correctly.
    ;; The manifestation is that TAB may list non-directories in the case where
    ;; those files also correspond to valid directories (if your cd-path is (A/
    ;; B/) and you have A/a a file and B/a a directory, then both `a' and `a/'
    ;; will be listed as valid completions).
    ;; This is because `a' (listed because of A/a) is indeed a valid choice
    ;; (which will lead to the use of B/a).
    (minibuffer-with-setup-hook
        (lambda ()
          (setq minibuffer-completion-table
                (apply-partially #'locate-file-completion-table
                                 cd-path nil))
          (setq minibuffer-completion-predicate
                (lambda (dir)
                  (locate-file dir cd-path nil
                               (lambda (f) (and (file-directory-p f) 'dir-ok))))))
      (unless cd-path
        (setq cd-path (or (parse-colon-path (getenv "CDPATH"))
                          (list "./"))))
      (read-directory-name "Change default directory: "
                           default-directory default-directory
                           t))))
  (unless cd-path
    (setq cd-path (or (parse-colon-path (getenv "CDPATH"))
                      (list "./"))))
  (cd-absolute
   (or (locate-file dir (cons default-directory cd-path) nil
                    (lambda (f) (and (file-directory-p f) 'dir-ok)))
       (error "No such directory found via CDPATH environment variable"))))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; https://qiita.com/shuntakeuch1/items/c127c7795b9428666080
;(require 'terraform-mode);;kkk
(add-hook 'terraform-mode-hook #'terraform-format-on-save-mode)

;; https://github.com/pcn/emacs-terraform-mode

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:
;; 日記作成ようの設定
;;   https://gntm-mdk.hatenadiary.com/entry/2014/04/15/222247
;; 使用例（参考になった）
;;   http://qiita.com/tamurashingo@github/items/ee033dadab64269edf63
;; htmlに出力できるらしい。
;;   http://www.geocities.jp/km_pp1/org-mode/org-mode-document.html
;; capture templates
(setq org-capture-templates
      '(("p" "Project Task" entry (file+headline (expand-file-name "~/project/project.org") "Inbox")
             "** TODO %?\n    %i\n    %a\n    %T")
        ("m" "memo" entry (file (expand-file-name "~/memo.org"))
             "* %?\n    %i\n    %a\n    %T")))
;; agenda
(setq org-agenda-files (list (expand-file-name "~/project")))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; https://blog.takuchalle.dev/post/2018/05/07/emacs_symbol_highlight/
;;; 1秒後自動ハイライトされるようになる
(setq highlight-symbol-idle-delay 1.0)
;;; 自動ハイライトをしたいならば
(add-hook 'prog-mode-hook 'highlight-symbol-mode)
;;; ソースコードにおいてM-p/M-nでシンボル間を移動
(add-hook 'prog-mode-hook 'highlight-symbol-nav-mode)
;;; シンボル置換
(global-set-key (kbd "M-s M-r") 'highlight-symbol-query-replace)

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
;; ;; embark-consult を読み込む
;; (with-eval-after-load 'consult
;;   (with-eval-after-load 'embark (require 'embark-consult)))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; color-moccur
;; https://maeshima.hateblo.jp/entry/20101120/1290227867
;; 
;;(install-elisp http://www.emacswiki.org/emacs/download/moccur-edit.el)
(require 'moccur-edit)
(global-set-key "\C-jm"	 'moccur)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; <https://kazuhira-r.hatenablog.com/entry/2021/10/30/222106>
;; Prettier 
;;  $ npm i -D -E -g prettier
;;  $ prettier --version
;;  $ echo {} > .prettierrc.json
;;  $ prettier --write src
;;
;; 虫ファイル「.prettierignore」

;; <https://qiita.com/ybiquitous/items/0761feeff7f31ba0a476>
;; Emacs + Prettier = ❤️
(defun my/prettier ()
  (interactive)
  (shell-command
    (format "%s --write %s"
      (shell-quote-argument (executable-find "prettier"))
      (shell-quote-argument (expand-file-name buffer-file-name))))
  (revert-buffer t t t))
(global-set-key (kbd "C-c C-p") 'my/prettier)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;このファイルに間違いがあった場合に全てを無効にします
;;(put 'eval-expression 'disabled nil)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; <http://0xcc.net/blog/archives/000041.html>
;; UTF-8 への移行計画
;;  新規に作成したファイルの文字コードを UTF-8 にするには次のように設定します。
;;  この設定は leim-list.el をロードしたりすると元の japanese-iso-8bit (EUC-JP)
;;  に戻されてしまうので、 .emacs の最後のほうに入れるのが無難です。
;;
;;  新規に作成したファイルの文字コードを UTF-8 にする
;;  この設定は leim-list.el をロードしたりすると元の japanese-iso-8bit (EUC-JP)
;;  に戻されてしまう
(set-language-environment "Japanese")
(set-terminal-coding-system 'utf-8-unix)
(set-keyboard-coding-system 'utf-8-unix)
(set-buffer-file-coding-system 'utf-8-unix)
(setq default-buffer-file-coding-system 'utf-8-unix)
(set-default-coding-systems 'utf-8-unix)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;
;;; end of file
;;;
(custom-set-faces
 ;; custom-set-faces was added by Custom.
 ;; If you edit it by hand, you could mess it up, so be careful.
 ;; Your init file should contain only one such instance.
 ;; If there is more than one, they won't work right.
 )
