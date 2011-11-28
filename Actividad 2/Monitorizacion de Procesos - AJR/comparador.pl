#!/usr/bin/perl

$archivo = $ARGV[0];
open FICH, $archivo or die "Error $!";
while (<FICH>) {	
	if (($_ cmp <STDIN>) != 0) { exit 0; }
}
exit 1;
