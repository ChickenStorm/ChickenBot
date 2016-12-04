#!/bin/sh

a=1

until [ $a -ge 100 ]
do
	rm -f tenc
	#cp tenc2.txt tenc
	nodejs bot.js > out/stdout$a.txt
	a=`expr $a + 1`
done