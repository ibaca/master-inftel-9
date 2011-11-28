/************************ FUNCIONES ALBERTO ****************/

var num_img = 4;
var img_act = 0;
var timer_banner;
var banner_active = true;

$(function() {
    ir_banner(0);
});
function pause() {
    $("#btn_pause").addClass("dnone");
    $("#btn_play").removeClass("dnone");
    banner_active = false;
    clearTimeout(timer_banner);
}
function play() {
    $("#btn_play").addClass("dnone");
    $("#btn_pause").removeClass("dnone");
    banner_active = true;
    siguiente_banner();
}
// funcion siguiente -----------------
function siguiente_banner() {
    if (num_img > 1) {
        if ((img_act + 1) < num_img) {
            img_act += 1;
        }else {
            img_act = 0;
        }
        ir_banner(img_act);
    }
} // end function
function anterior_banner() {
    if (num_img > 1) {
        if (img_act > 0) {
            img_act -= 1;
        }else {
            img_act = num_img-1;
        }
        ir_banner(img_act);
    }
} // end function
function ir_banner(num) {
    if (num_img > 1) {
        img_act = num;
        desplazamiento = (num * -563);
        $("#slider").animate({left: desplazamiento}, 500);

        if (banner_active) {
            clearTimeout(timer_banner);
            timer_banner = setTimeout('siguiente_banner()', 5000);
        }

        mostrarMarcas();
    }
} // end function
function mostrarMarcas() {
    for (i=1; i <= num_img; i++) {
        if(img_act+1==i) {
            $("#b"+(i)).removeClass("control_desactivo");
            $("#b"+(i)).addClass("control_activo");
        } else {
            $("#b"+(i)).addClass("control_desactivo");
            $("#b"+(i)).removeClass("control_activo");
        }

    }
}

// Buscador

$(function() {

    var peliculas, peliculasTags = [];
    var usuarios;

    // Decidir que registro mostrar (identificar o saludo)
    if (localStorage.conectado == "si") {
        nombre = localStorage.getItem('nombre');
        $.get("../../peliculas/ajax/desconectar.txt", function(data) {
            $("#login_form").html(data);
            $("#elnombre").html("Hola, " + nombre);
        });
    } else {
        $("#login_form").load("../../peliculas/ajax/identificar.txt");
    }
    
    $.getJSON('../../peliculas/ajax/buscador.json', function(data) {
        peliculas = data;

        for (var property in peliculas) {
            peliculasTags.push(property);
        }

        $("#buscador .texto").autocomplete({
            source: peliculasTags
        });
    });

    $.getJSON('../../peliculas/ajax/usuarios.json', function(data) {
        usuarios = data;
    });

    function cambiaPagina(url) {
        window.location.href = url;
    }

    $("#buscador").submit(function(event) {
        var texto = $("#buscador .texto").val();
        event.preventDefault();
        if (peliculas[texto] !== undefined) {
            setTimeout(cambiaPagina("../../peliculas/paginas/" + peliculas[texto]), 2*1000 );
        } else {
            $(".ui-autocomplete-input").addClass("borde-rojo");
        }
    });

    //Desconexion
    $("#login_form").delegate("#logout", "click", function(event){
        event.preventDefault();
        delete localStorage['nombre'];
        localStorage.conectado = "no";
        $("#login_form").load("../../peliculas/ajax/identificar.txt");
    });

    // Registro con LocalStorage
    $("#login_form").delegate("#registro", "submit", function(event) {
        event.preventDefault();
        var nombre = $("#reg-user").val();
        var pass = $("#reg-pass").val();
        if (usuarios[nombre] == pass) {
            localStorage.setItem('conectado', "si");
            localStorage.setItem('nombre', nombre);
            $.get("../../peliculas/ajax/desconectar.txt", function(data) {
                $("#login_form").html(data);
                $("#elnombre").html("Hola, " + nombre);
            });
        } else {
            $("#reg-user").attr("class", "borde-rojo");
            $("#reg-pass").attr("class", "borde-rojo");
        }
    });

    $("ul.subnav").parent().append("<span></span>").addClass("desplegable");

    $("ul.topnav li.desplegable").hover(function() {
        clearTimeout($(this).data('timeoutId'));
        $(this).find("ul.subnav").slideDown('fast').show()
        $(this).addClass("subhover");
    }, function(){
        var someelement = this;
        var timeoutId = setTimeout(function(){$(someelement).find("ul.subnav").slideUp('slow');}, 650);
        $(someelement).data('timeoutId', timeoutId);
    });
    
    //Eventos asociados al carrusel
});

/************************ FUNCIONES FRAN ****************/

//funcion ventana emergente
$(function(){
    //llamada tras la carga de la página
    $("#login_form").delegate("a.popup", "click", function(){
       //indicamos que al hacer click en cualquier elemento "a" que tenga la clase "popup" ejecute la siguiente función
    var destino = $(this).attr("href"); //obtenemos el destino del enlace
    var anchoventana = 350;
    var altoventana = 200;
    $.ajax({type: "GET",
    url: destino, success: function(data){
        //indicamos la función que se ejecutará al recibir los datos en la variable data exitosamente
        //limitamos el contenido del documento a lo que está dentro de la etiqueta body
        var ini = data.indexOf("<body");
        if (ini>=0)
        {
            ini = data.indexOf(">", ini)+1;
            var fin = data.indexOf("</body");
            fin = fin-ini;
            var datos= data.substr(ini, fin);
        }
        else
        {
            var datos = data;
        }
        //si el contenido del documento tiene la etiqueta title, la extraemos para utilizarla como titulo de la ventana
        ini = 0;
        ini = data.indexOf("<title");
        if (ini>=0)
        {
            ini = data.indexOf(">", ini)+1;
            fin = 0;
            fin = data.indexOf("</title");
            fin = fin-ini;
            var titulo= data.substr(ini, fin);
        }
        else
        {
            var titulo = "Ventana Emergente";
        }
        $("body").append('<div>'+datos+'</div>');
           //adjuntamos los datos recibidos en una capa con la clase "ventana" al final del documento
        $("div.ventana").dialog({
               //indicamos que las capas con la clase "ventana" son ventanas de dialogo
            modal:true,
            show: "clip",
            hide: "clip",
            buttons: {"Enviar": function() {  },
                        "Cerrar": function() {$(this).dialog("close");}
        }, 
            closeText: 'Cerrar',
            title: titulo,
            height: altoventana,
            width: anchoventana,
            close: function(){
               //indicamos la función que se ejecutará al cerrarse la ventana
            $(this).remove();
               //borramos la capa
            }
        });
    }
    });
    return false;
    });
});