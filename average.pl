#!/bin/perl

#
# 計測結果の集計
#   ・log ディレクトリがと同じ階層で実行
#   ・all_log.csv に結果を出力
#   ・,μsec,関数名,ファイル名,サイズ,ソース行:ソース の順に出力
#
#   ・だいたい1回目の出力は待ちが入る為、捨てる
#   ・実行中に進捗が分かるように「.」を表示
#

my %all_data = ();

opendir DH, "./log" or die $!;
while(my $file = readdir DH){
    next if $file =~ /^\./;
    open FH, "< ./log/$file" or die $!;

    my $type;
    my $size;
    my $time;
    my $count;
    my %data;
    while(my $line = <FH>){
        chomp $line;
        $line =~ s/ *//g;
        my @strlist = split(/,/, $line);

        $time = $strlist[1] * 1000000;
        if($strlist[2] == 0){
            print STDERR "\n";
            $type = $strlist[3];
            $size = $strlist[4];
            %data = ();
        } elsif ($strlist[2] =~ /^[0-9]+$/){
            print STDERR ".";
            $data{"$type,$size"}[0] += $time;
            $data{"$type,$size"}[1] ++;
            for my $key (keys %data){
                my $h_key;
                $h_key = sprintf("%s,% 6d,%s", $file,$size,$key);
                $all_data{$h_key} = int($data{$key}[0] / $data{$key}[1]);
            }
        } elsif ($type eq ""){
        } else {
            $data{$strlist[2]}[0] += $time;
            $data{$strlist[2]}[1] ++;
        }
    }
    close FH or die $!;
    print STDERR "\n";
}
closedir DH or die $!;

open FH, "> all_log.csv" or die $!;
for my $key (sort keys %all_data){
    my $func = "";
    $func = $1 if($key =~ /.*[:\=](\w+)\(/);
    $func = $1 if($key =~ /,(tcp|ssl|udp|dtls),/);
    #print "$key, $all_data{$key}\n";
    printf(FH ",% 6d,%s,%s\n", $all_data{$key}, $func, $key);
}
close FH or die $!;
