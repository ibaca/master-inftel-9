#!/usr/bin/awk -f
{
	if ($1 > 5) {
		print $2
	}
}
