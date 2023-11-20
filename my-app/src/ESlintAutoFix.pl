#!/bin/perl
use strict;
use warnings;
use File::Find;
use Data::Dumper;

# 1:react-hooks/exhaustive-deps
# 2:react/jsx-no-bind
# 3:no-unused-vars

# prettierの標準でフォーマットを修正していること、その後に eslint を行う事
# https://rfs.jp/sb/vsc/vsc-prettier.html
#  $ npx prettier --write ./App.js
#  $ npx eslint ./App.js | tee ./eslint_log.txt

sub Main(){
    my $BUF = (' ' x 10000 );
    my $file = './eslint_log.txt';
    my %es = (all => 0, m1 => 0, m2 => 0);
    my %es_old = (all => 0, m1 => 0, m2 => 0);
    &ReadFile($file, \$BUF);
    &CheckEslintS(\$BUF, \%es);
    &ReadFile($es{file}, \$BUF);
    &CheckSource(\$BUF, \%es);

    # 修正ファイルにて更新
    $es{file} = "./a.js";
    my $fh;
    open $fh, '>', "$es{file}"
        or die "Can't open a.js: $!";
    print $fh $BUF;
    close $fh or die "$!";
    %es_old = %es;

    # 再チェック
    system("npx prettier --write $es{file}");
    $file = './eslint_tmp.log';
    system("npx eslint $es{file} > $file");
}

################################################################################
# react/jsx-no-bind
sub jsx_no_bind($$$){
    my $arr = shift;
    my $func_start = shift;
    my $func_end = shift;
    my $src = $arr->[$func_start]->{s};
    &ErrorDie($arr) if($src !~ /on(?:Click|Change) *=(.*)/);
    my $cb = $1;
    $arr->[0]->{now} = $func_start;

    if($cb !~ / =>/ && $cb =~ /\{(\w+)\}/){
        # 関数のリファレンスが指定されている場合
        my %ret = ();
        my $w = $1;
        &SearchFuncBackward($arr, $w, \%ret);
        &SearchFuncForward($arr, $w, \%ret, $ret{s});
        &ErrorDie( $arr ) if $arr->[$ret{s}]->{s} !~ s/$w =/$w = useCallback(/;
        &ErrorDie( $arr ) if $arr->[$ret{e}]->{s} !~ s/};/}, []);/;
        return;
    } elsif($func_start == $func_end) {
        # 1行で完了している場合
        if($arr->[$func_start]->{nst} > 3){
            print "skip Line: $func_start\n";
            return;
        }
        # 関数宣言が指定されている場合
        my %cbfunc = (sw => "\{", ew => "\}");
        my $w = "";
        for($cb =~ /(.)/g){
            $w .= $_;
            &BC($_, \%cbfunc);
            next if $cbfunc{nst} != 0;

            $arr->[0]->{func}++;
            my $handler = "onHander$arr->[0]->{func}";
            $w =~ s/^{//;
            &ErrorDie($arr) if $w !~ s/} *$//;
            $cb = quotemeta($w);
            &ErrorDie($arr) if $arr->[$func_start]->{s} !~ s/\{(.*$cb)\}/{$handler}/;
            &MakeUseCallback($arr, $handler, $w);
            return;
        }
    } elsif($cb =~ /{$/){
        if($arr->[$func_start]->{nst} > 3){
            print "skip Line: $func_start\n";
            return;
        }
        # 複数行のコールバックの場合
        $arr->[0]->{func}++;
        my $handler = "onHander$arr->[0]->{func}";
        # CBの最初
        &ErrorDie( $arr ) if(
            $arr->[$func_start]->{s}
            !~ s/(on(?:Click|Change) *= *\{)(.*)/$1{$handler}/
            );
        for(my $i = $func_start + 1; $i < $func_end; $i++){
            $cb .= $arr->[$i]->{s};
            $arr->[$i]->{s} = "";
        }
        &ErrorDie( $arr ) if $cb !~ s/} $//;
        &MakeUseCallback($arr, $handler, $cb);
        return;
    }
    &ErrorDie( $arr, $src, $cb, $func_start, $func_end );
}

sub MakeUseCallback($$$){
    my $arr = shift;
    my $func = shift;
    my $cb = shift;

    my $max = $arr->[0]->{now} - 1;
    for(my $i = 0; $i < $max; $i++){
        my $now = $max - $i;
        if( $arr->[$now]->{nst} == 1 ){
            $arr->[$now]->{s} .= "const $func = useCallback($cb, []);\n";
            return;
        }
    }
    &ErrorDie( $arr, $func, $cb );
}

sub CheckSource($$){
    my $buf = shift;
    my $es = shift;

    my @arr = ({all=>0, now=>0, func=>0});
    my $func = 0;
    my $line = 1;
    my %main = (sw => '(?:\{|\(|\[)', ew => '(?:\}|\)|\])');
    for ( $$buf =~ /(.*\n)/g ){
        &BC( $_, \%main );
        push( @arr, {s => $_, nst => $main{nst}});
        $arr[0]->{all} = $line;
        my $now = $line;
        $now = $func if( $func != 0 );
        if(!exists $es->{ $now }){
            $line++;
            next;
        }
        my $match = $es->{ $now };

        if($match->{m} == 1){
            # react-hooks/exhaustive-deps
            # hock の依存関係の追加を行う
            my $val = $match->{s};
            /\[([^\]]*)\]/;
            my $org = $1;
            $org =~ s/ *//g;
            if( length( $org ) > 0 ){
                &ErrorDie( \@arr ) if(!s/\[([^\]]*)\]/[$1, $val]/);
            } else {
                &ErrorDie( \@arr ) if(!s/\[([^\]]*)\]/[$val]/);
            }
            $arr[ $now ]->{s} = $_;
        } elsif($match->{m} == 2){
            # jsx-no-bind
            if($func != 0){
                # コールバック関数が複数行の途中、開始位置とブロックが同じなら
                if( $arr[ $now ]->{nst} == $arr[ $func ]->{nst} ){
                    &jsx_no_bind(\@arr, $func, $now);
                    $func = 0;
                }
            } elsif( $arr[ $now ]->{nst} == $arr[ $now - 1 ]->{nst} ){
                # コールバック関数が単一行
                &jsx_no_bind(\@arr, $now, $now);
            } else {
                # コールバック関数が複数行の開始
                $func = $now;
            }
        }

        $line++;
    }
    $$buf = "";
    foreach my $w ( @arr ){
        next if !exists $w->{s};
        $$buf .= $w->{s};
    }
}

sub CheckEslintS($$){
    my $in = shift;
    my $es = shift;

    my $file = "";
    for($$in =~ /(.*)\n/g){
        next if /^$/;
        next if /\d+ +problems +/;
        if(/^.*\.(?:js|mjs)/){
            s/\\/\//g;
            $file = $_;
            $es->{file} = $file;
            next;
        }

        / *(\d+):\d+ *error /;
        my $line = $1;
        if(m#react-hooks/exhaustive-deps#){
            /'(.*?)'/;
            %{$es->{ $line }} = (m => 1, s => $1);
            $es->{ m1 }++;
            $es->{ all }++;
        } elsif(m#react/jsx-no-bind#){
            %{$es->{ $line }} = (m => 2);
            $es->{ m2 }++;
            $es->{ all }++;
        }
    }
}

# find(\&wanted, @directories_to_search);
# sub wanted {
#     ...
# }


################################################################################
sub ErrorDie($){
    my $arr = shift;
    my $ret = shift;
    print Dumper $arr->[0];
    foreach(@_){
        print Dumper $_;
    }
    die $!;
}
sub GetSource($){
    my $w = shift;

    # コメントの除外
    $w =~ s@//.*@@;
    $w =~ s@/\*.*?\*/@@g;

    # 文字列の除外
    $w =~ s@".*?"@@g;
    $w =~ s@'.*?'@@g;

    # アスキー以外を消す
    $w =~ s/\P{ascii}+//g;

    return $w;
}

# 指定配列の指定位置から、ブロックの終了までを検索する
sub SearchFuncForward($$$$){
    my $list = shift;
    my $w = shift;
    my $ret = shift;
    my $seek_s = shift;

    $ret->{ss} = 0;
    $ret->{e} = 0;

    my $max = $list->[0]->{all} - 1;
    my %sub = (sw => '\(', ew => '\)', nst => 0);
    my $cmm = 0;
    for(my $i = $seek_s; $i < $max; $i++){
        my $src = &GetSource($list->[$i]->{s});
        $cmm = 1 if($w =~ m@/\*.*@);
        $cmm = 0 if($_ =~ s@.*?\*/@@);
        next if ( $cmm == 1 );
        $list->[0]->{now} = $i;

        if($sub{nst} > 0){
            &BC( $src, \%sub );
        } elsif( $src =~ /const *$w [^\>]+\=\> *(\(|\{|<\w+)/ ){
            my $s = $1;
            if( $s eq '(' ){
                &BC( $src, \%sub );
            } elsif($s eq '{'){
                %sub = (sw => '\{', ew => '\}');
                &BC( $src, \%sub );
            } elsif($s =~ /<(\w+)/){
                my $req = quotemeta( $1 );
                %sub = (sw => $req, ew => '</ $req>');
                &BC( $src, \%sub );
            }
        } elsif( $src =~ /function $w *\(/ ||
                 $src =~ /const $w = function *\(/ ){
            $sub{ func } = 1;
            &BC( $src, \%sub );
            if( $sub{nst} == 0){
                $ret->{ss} = $i;
                %sub = (sw => '\{', ew => '\}');
                &BC( $src, \%sub );
            }
        } elsif(exists $sub{ func } && $sub{ func } == 1){
            &BC( $src, \%sub );
            if( $sub{nst} == 0){
                $ret->{ss} = $i;
                %sub = (sw => '\{', ew => '\}');
                &BC( $src, \%sub );
            }
        } else {
            next;
        }
        if( $sub{nst} == 0){
            $ret->{e} = $i;
            return;
        }
    }
    &ErrorDie($list, $ret);
}
# 指定配列の最後から逆順に検索し文字列が現れる配列の位置を検索する
sub SearchFuncBackward($$$){
    my $list = shift;
    my $w = shift;
    my $ret = shift;

    $ret->{s} = 0;

    my $max = $list->[0]->{all} - 1;
    my $cmm = 0;
    for(my $i = 0; $i < $max; $i++){
        my $now = $max - $i;
        my $src = &GetSource( $list->[$now]->{s} );
        $cmm = 1 if($src =~ m@/\*.*@);
        $cmm = 0 if($src =~ s@.*?\*/@@);
        next if ( $cmm == 1 );

        if($src =~ /(?:function|const) $w\b/ ||
            $src =~ /const $w = function/){
            $ret->{s} = $now;
            return;
        }
    }
    &ErrorDie($list);
}

# 文字列中の開始・終了キーワードに基づく、ブロックのネスト状態を判別する
# 1:検索対象の文字列
# 2:パラメータ連想配列の中身
#   sw :開始文字列
#   ew :終了文字列
#   omm:コメント中状態
#   nst:現在のブロックネスト数
# BlockCount
sub BC($$){
    my $w = &GetSource(shift);
    my $map = shift;

    # 初期化
    if( !exists $map->{cmm} ){
        $map->{cmm} = 0;
        $map->{nst} = 0;
        #$map->{sw} = quotemeta($map->{sw});
        #$map->{ew} = quotemeta($map->{ew});
    }

    # ブロック検索
    for($w =~ /((?:$map->{sw}|$map->{ew}|\/\*.*|.*?\*\/))/g){
        $map->{cmm} = 1 if(m@/\*@);
        $map->{cmm} = 0 if(m@\*/@);
        next if $map->{cmm};
        $map->{nst}++ if(/$map->{sw}/);
        $map->{nst}-- if(/$map->{ew}/);
    }
}

# ファイルの内容を一度に読み込む
sub ReadFile($$){
    my $file = shift;
    my $buf = shift;

    $$buf = "";
    open my $fh, '<', $file
        or die "Can't open $file: $!";

    $$buf = do { local $/; <$fh> };
    close $fh or die $!;
}

# 参考サイト
# 変数名：https://codic.jp/engine
# eslint:
#   ESLint: https://runebook.dev/ja/docs/eslint/-index-?q=
#   eslint-plugin-react:  https://github.com/jsx-eslint/eslint-plugin-react
#

&Main();
