#!/bin/bash

# Metodo para enviar los emails
Mandar_mail() {
	line=$1
	fecha=$(date '+%d-%m-%Y %T')
	mail "root" <<FINAL
Se ha creado este mensaje automático como consecuencia de que un proceso tiene más de 5 hijos.
Datos:
- PID del proceso: $line
- Fecha de creción del mail: $fecha
- Propietario del proceso: `ps -o "%u" -p $line --no-header`
- Árbol del proceso:
`pstree -p $line`
FINAL
}

# Metodo que arranca si el usuario presiona control-c
control_c() {
	if [ -e resultado.txt ]; then
		rm resultado.txt
	fi

	if [ -e res_final.txt ]; then
		rm res_final.txt
	fi

	if [ -e pstree ]; then
		rm -R pstree
	fi
	
	echo "Realizando limpieza final."

	exit 0
}

# Inicialiacion de variables
params_err=0
verbose=0
debug=0
timeout=30

# Procesamos las opciones pasadas al programa
while getopts ":vdt:" optname
do
	case "$optname" in
		"v")
			verbose=1
			;;
		"d")
			debug=1
			;;
		"t")
			timeout=$OPTARG
			;;
		"?")
			params_err=1
			;;
		":")
			params_err=1
			;;
		*)
			# Should not occur
			echo "Error procesando argumentos"
			;;
	esac
done

# params_err estara a 1 cuando las opciones pasadas al programa estan malformadas
if [ $params_err = 1 ]; then
	echo "Malformacion de las opciones."
	exit 1
fi

# Guardamos el numero de argumentos procesados y el numero de argumentos totales
ini_args=$OPTIND
fin_args=$[$#+1]

# Comprobamos si se han introducido argumentos que no corresponde con la ejecucion del programa
if [ $ini_args != $fin_args ]; then
	echo "Error, argumentos inexperados."
	exit 1
fi
 
# Capturamos el evento CONTROL_C para que cuando se cierre el programa se hagan tareas de limpieza antes 
trap control_c SIGINT

# Si estamos en modo debug crear carpeta debug si no existe
if [ $debug = 1 ]; then
	if [ ! -e debug ]; then
		mkdir debug
	fi
fi

# Crea la carpeta pstree si no existe
if [ ! -e pstree ]; then
	mkdir pstree
fi

# Entramos en un bucle infinito para monitorizar los procesos
while [ 1 -eq 1 ];
do
	#Esperamos $timeout segundos para monitorizar de nuevo los procesos
	sleep $timeout
	if [ $verbose = 1 ]; then
		echo "Monitorizando procesos..."
	fi
	# Guardamos en resultado.txt los pids padres de procesos con más de un hijo, junto con el número de hijos
	ps -eo "%P" --sort ppid --no-header | uniq -c -d > resultado.txt
	# Filtramos dejando solo los procesos que tengan mas de 5 hijos
	./cuenta_hijos.awk < resultado.txt > res_final.txt 
	# Se comprueba si es necesario enviar un mail
	{
		while read line; do
			enviar_mail=0
			
			if [ ! -e pstree/$line.txt ]; then
				if [ $verbose = 1 ]; then
					echo "Dectectado nuevo proceso con +5 hijos: $line - Mandando mail..."
				fi				
				enviar_mail=1
			elif [ `pstree -p $line | wc -l` -ne `less pstree/$line.txt | wc -l` ]; then
				if [ $verbose = 1 ]; then
					echo "Hay un numero distinto de hijos del proceso: $line - Mandando mail..."
				fi
				enviar_mail=1
			else
				pstree -p $line | ./comparador.pl "pstree/$line.txt"
				if [ $? = 0 ]; then 
					if [ $verbose = 1 ]; then
						echo "Han cambiado los hijos del proceso: $line - Mandando mail..."
					fi
					enviar_mail=1
				fi
			fi
			if [ $enviar_mail = 1 ]; then
				pstree -p $line > pstree/$line.txt
				if [ $debug = 1 ]; then
					CURRENT=$(date '+%s') 
					pstree -p $line > debug/$CURRENT-$line.txt
				fi
				Mandar_mail $line
			fi
		done 
	} < res_final.txt
done
