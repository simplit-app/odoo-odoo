@echo off
setlocal enabledelayedexpansion

set "directory=.\addons_simplit"

rem echo El directorio usado para convertir los directorios es: %directory%

for %%f in ("%directory%\*") do (
    set "filename=%%f"
    set "content="

    for /f "tokens=* delims=" %%a in (!filename!) do (
        set "content=!content!%%a"
    )

    rem Eliminar cualquier enlace simbólico previo con el mismo nombre
    del "%directory%\%%~nf"

    rem Crear un enlace simbólico con el nombre del archivo y el contenido como destino
    mklink "%directory%\%%~nf" "!content!"
	
)

endlocal
