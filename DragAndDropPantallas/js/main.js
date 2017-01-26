/* Creado por Adib Abud Jaso el 07/07/16. */
$(function() {
    //Configuración de diálogo jQuery UI (Se usa para mensaje de calificacion e informativos)
    var uiDialogo = $("#dialog");
    uiDialogo.dialog({
        title:"Mensaje",
        modal:true,
        show:"slideDown",
        hide:"slideUp",
        autoOpen:false,
        buttons: [
            {
                text: "Aceptar",
                icons: {
                    primary: "ui-icon-check"
                },
                click: function() {
                    $(this).dialog( "close" );
                }
            }
        ]
    });
    /*
    Agrega el comportamiento para arrastrarse y colocarse.
    */
    var ATRIBUTO_COLOCADO = "objColocado";
    $(".draggable").draggable({
        revert : function(event, ui) {
            //La propiedad originalPosition se usa para regresar
            //el draggable a su punto original cuando no es arrastrado 
            //a algún droppable que lo acepte.
            $(this).data("uiDraggable").originalPosition = {
                top : 0,
                left : 0
            };
            //Asigna el dropable a una propiedad del draggable para posterior revisión (false si no hay droppable)
            $(this).data(ATRIBUTO_COLOCADO, event);
            //console.log("evento", event);
            return !event;//event regresa falso si no hay droppable event
        },
        stack: ".draggable"//poner z-index automático
    });
    $(".droppable").droppable({
        hoverClass: "ui-droppable-hover",//Tuve que cambiar la clase por defecto (ui-state-hover) por el bug de firefox
        drop: function( event, ui ) {
            //Cambiar opciones de algún elemento de jQuery UI
            //$(this).droppable("option", "disabled", false);
            //console.log(ui.draggable, $(this));
            
            //Cambia las classes CSS
            var $this = $(this);
            $(".highlight").removeClass("highlight");
            $this.addClass("highlight");

            //Ajusta el ancho
            $this.width(ui.draggable.width());
            //Ajusta y anima la posición al centro
            ui.draggable.position({
                my: "center",
                at: "center",
                of: $this,
                using: function(pos) {
                  $(this).animate(pos, "fast", "linear", function(){actualizarPosiciones();});
                }
            });

        },
        accept: function(dropElem) {//Si el droppable ya está ocupado, no lo acepta
            //Obtiene dragables
            var lstDraggables = $(".draggable");
            //De ellos extrae los que están colocados (ATRIBUTO_COLOCADO);
            var lstOcupados = lstDraggables.map(function(i, elemento){
                return $(elemento).data(ATRIBUTO_COLOCADO);
            });
            //Convierte en arreglo
            var arrOcupados = [];
            lstOcupados.each(function(i, ocupado){
                arrOcupados.push(ocupado);
            });
            //Revisa en el arreglo si en ellos está el destino y acepta si no está
            var self = $(this);
            var resultado = arrOcupados.some(function(elemento){
                return elemento[0] === self[0];
            });
            return !resultado;
        }
    });
    /*
    Calificar 
    */
    var intContadorBuenas = 0;
    var intTotal = $(".droppables > .pagina .droppable").length;
    $("button#btnRevisar").button().click(function(event) {
        event.preventDefault();
        //Guarda todas las propiedades de los draggable en un arreglo para revisar si todas han sido asignadas
        var arrContestado = [];
        var lstDraggables = $(".pagina:first-child .draggable");
        var lstDroppables = $(".pagina:first-child .droppable");
        lstDraggables.each(function(i, element){
            arrContestado.push({attr_colocado:$(element).data(ATRIBUTO_COLOCADO), dragado:element});
        });
        var arrHechas = arrContestado.filter(function(elemento){
            return elemento.attr_colocado;
        });
        //Si se  han colocado uno de los draggables, se procede a revisar el reactivo
        if(lstDroppables.length === arrHechas.length){
            arrHechas.forEach(function (activo) {
                //Si es correcta, se contabiliza y asigna clase de correcta
                var strContestado = $(activo.dragado).data("respuesta");
                var strCorrecta = activo.attr_colocado.data("respuesta");
                if(strContestado === strCorrecta){
                    $(activo.dragado).addClass("bien");
                    $(activo.dragado).removeClass("mal");
                    intContadorBuenas++;
                } else {//sino, se asigna clase de incorrecta
                    $(activo.dragado).addClass("mal");
                }
                var retro = activo.attr_colocado.closest(".pagina").children(".retroInd").html();
                uiDialogo.html(retro).dialog( "option", "title", "Mensaje" ).dialog("open");
                $(".barraInferior").addClass("contestada");
                $(".draggable").draggable("disable");
            });
        }
    });
    //Botón siguiente
    $("button#btnSiguiente").click(function () {
        $(".barraInferior").removeClass("contestada");
        $(".droppables > .pagina:first-child").remove();
        //Regresa la opción mal y le quita el tache
        reiniciarPosicion(null, $(".mal").removeClass("mal"));
        $(".bien").remove();
        $(".draggable").draggable("enable");

        //Si ya terminó
        var divRespuestas = $(".droppables");
        if(divRespuestas.children().length === 0){
            $("#retroFinal").html("Obtuviste " + intContadorBuenas + " de " + intTotal + ".");
            $("#btnRevisar").hide();
        }
    });
    //Reiniciar todas las propiedades y atributos
    $("button#btnReiniciar").button().click(function(){
        /*var lstDraggables = $(".draggable");
        lstDraggables.removeClass("bien");
        lstDraggables.removeClass("mal");
        lstDraggables.each(reiniciarPosicion());*/
        window.location.reload(false);
    });
    function reiniciarPosicion(i, element){
        $(element).data(ATRIBUTO_COLOCADO, false);
        $(element).css({
            'left': 0,
            'top': 0
        })
    }
    //Función para actualizar la posición de los objetos ya colocados
    function actualizarPosiciones(){
        var lstDraggables = $(".draggable");
        lstDraggables.each(actualizarPosicion);
    }
    function actualizarPosicion(i, elemento){
        var objAbajo = $(elemento).data(ATRIBUTO_COLOCADO);
        if(objAbajo !== undefined && objAbajo !== false){
            /*//Ajusta el ancho
             var numAnchuraAmbos = $(elemento).width();
             $(elemento).width(numAnchuraAmbos);
             objAbajo.width(numAnchuraAmbos);*/
            //Ajusta la posición
            $(elemento).position({
                my: "center",
                at: "center",
                of: objAbajo
            });
        }
    }
    $(window).resize(actualizarPosiciones);


    //Revolver arrastrables
    var revolverLista = (function () {
        function randomInt(maxNum) { //returns a random integer from 0 to maxNum-1
            return Math.floor(Math.random() * maxNum);
        }
        return function shuffleList(selectorPadre, selectorHijos) {
            var origList = selectorHijos.detach();
            var newList = origList.clone();

            for (var i = 0; i < newList.length; i++) {
                //select a random index; the number range will decrease by 1 on each iteration
                var randomIndex = randomInt(newList.length - i);

                //place the randomly-chosen element into our copy and remove from the original:
                newList[i] = origList.splice(randomIndex, 1);

                //place the element back into into the HTML
                selectorPadre.append(newList[i]);
            }
        }
    })();
    //revolverLista("div.arrastrables","div.arrastrables > .draggable");
    $(".pagina").each(function(){
        var selectorPadre = $(this).find(".arrastrables");
        var selectorHijos = selectorPadre.find("> .draggable");
        revolverLista(selectorPadre, selectorHijos);
    });
});
