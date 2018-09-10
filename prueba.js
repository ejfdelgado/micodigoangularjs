
var prueba = {
	nombre: 'Edgar',
	apellido: 'Delgado',
	empresa: {
		nombre: null
	},
	indentificacion: {
		tipo:'cc',
		numero: 1010166710,
		valid: true,
	},
	colores: [
		'rojo',
		'verde',
		'azul'
	],
	animales: [
		5,	
		{
			nombre: 'oso',
			edad: 3,
			gustos: ['pan', 'miel'],
		},
			
		{
			nombre: 'oveja',
			edad: 8,
			gustos: ['pasto', 'agua'],
		},
		{
			nombre: 'camello'
			
		},
	]
};

//pc-3255-hngx1

var respuesta = moduloTransformacion.modo('simple').to(prueba);
var respuesta2 = moduloTransformacion.modo('simple').from(respuesta);

console.log(JSON.stringify(respuesta, null, 4));
console.log(JSON.stringify(respuesta2, null, 4));
console.log(JSON.stringify(prueba, null, 4));

$(document).ready(function() {
	
	var droppable = new Draggable.Droppable(document.querySelectorAll('.padre'), {
	  draggable: '.arrastrame',
	  droppable: '.destino'
	});
	
	
	droppable.on('droppable:dropped', () => console.log('droppable:dropped'));
	droppable.on('droppable:returned', () => console.log('droppable:returned'));
	droppable.on("droppable:over", function() {
	  $(".destino").removeClass("draggable-droppable--occupied");
	});
	
});