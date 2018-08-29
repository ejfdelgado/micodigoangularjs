
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

var respuesta = moduloTransformacion.modo('simple').to(prueba);
var respuesta2 = moduloTransformacion.modo('simple').from(respuesta);

console.log(JSON.stringify(respuesta, null, 4));
console.log(JSON.stringify(respuesta2, null, 4));
console.log(JSON.stringify(prueba, null, 4));