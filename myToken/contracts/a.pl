#!/usr/bin/perl

use strict;

my $hex = 'ba420816000000000000000000000000627306090abab3a6e1400e9345bc60c78a8bef57';
my $hex_length = length( $hex );
my $bin_length = $hex_length * 4;
 
my $num = unpack("B" . $bin_length,  pack("H" . $hex_length, $hex ));
print "$num\n";
