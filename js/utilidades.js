"use strict";

var utilidades;
var moduloTransformacion;

(function(a){typeof module!="undefined"&&module.exports?module.exports=a():typeof define=="function"&&typeof define.amd=="object"?define("json.sortify",a):JSON.sortify=a()})(function(){/*!
*    Copyright 2015-2017 Thomas Rosenau
*
*    Licensed under the Apache License, Version 2.0 (the "License");
*    you may not use this file except in compliance with the License.
*    You may obtain a copy of the License at
*
*        http://www.apache.org/licenses/LICENSE-2.0
*
*    Unless required by applicable law or agreed to in writing, software
*    distributed under the License is distributed on an "AS IS" BASIS,
*    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*    See the License for the specific language governing permissions and
*    limitations under the License.
*/
var a=function(b){if(Array.isArray(b))return b.map(a);if(b instanceof Object){var c=[],d=[];return Object.keys(b).forEach(function(a){/^(0|[1-9][0-9]*)$/.test(a)?c.push(+a):d.push(a)}),c.sort(function(c,a){return c-a}).concat(d.sort()).reduce(function(c,d){return c[d]=a(b[d]),c},{})}return b},b=JSON.stringify.bind(JSON);return function sortify(c,d,e){var f=b(c,d,0);if(!f||f[0]!=="{"&&f[0]!=="[")return f;var g=JSON.parse(f);return b(a(g),null,e)}});

(function($) {

	console.log("Iniciando Untilidades JS");

	//---------------------------- comunes
	/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
	 * http://benalman.com/
	 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
	(function(a){var b=a({});a.subscribe=function(){b.on.apply(b,arguments)},a.unsubscribe=function(){b.off.apply(b,arguments)},a.publish=function(){b.trigger.apply(b,arguments)}})(jQuery);

	moduloTransformacion = (function() {
		var modos = {};
		
		var esNumero = function(dato) {
			if (typeof dato == 'number') {
				return true;
			}
			if (esTexto(dato) && /^\d+[.,]?\d*$/ig.test(dato)) {
				return true;
			}
			return false;
		}
		
		var esBooleano = function(dato) {
			return (typeof dato == 'boolean');
		}
		
		var esTexto = function(dato) {
			return (typeof dato == 'string');
		}	
		
		var hayValorEnLista = function(dato) {
			if (!esLista(dato)) {
				return false;
			}
			return dato.length > 0;
		}
		
		var hayValorEnObjeto = function(dato) {
			if (!esObjeto(dato, true)) {
				return false;
			}
			return Object.keys(dato).length > 0;
		};
		
		var hayValor = function(dato) {
			if (typeof dato == 'undefined' || dato === null) {
				return false;
			}
			return true;
		};
		
		var esLista = function(dato) {
			return dato instanceof Array;
		};
		
		var esObjeto = function(dato, estricto) {
			return (dato instanceof Object && (!estricto || !esLista(dato)));
		};
		
		var esFuncion = function(dato) {
			return (typeof dato == 'function');
		}
		
		var leer = function(dato, ruta) {
			var llaves = ruta.split('.');
			var actual = dato;
			for (var i=0; i<llaves.length; i++) {
				var llave = llaves[i];
				actual = actual[llave];
				if (!hayValor(actual)) {
					return null;
				}
			}
			return actual;
		};
		
		var iterarObjeto = function(objeto, funcion, ruta, original, padre, debug) {
			objeto = recrear(objeto);
			if (debug){console.log('objeto', recrear(objeto));}
			if (!hayValor(original)) {
				original = objeto;
			}
			var esRaiz = !hayValor(ruta);
			if (!esObjeto(objeto)) {
				//Es hoja de tipo básico
				if (esFuncion(funcion)) {
					funcion(ruta, objeto, original, padre)
				}
				return;
			}
			var llaves = Object.keys(objeto);
			if (debug){console.log('llaves', llaves);}
			for (var i=0; i<llaves.length; i++) {
				var llave = llaves[i];
				iterarObjeto(objeto[llave], funcion, esRaiz ? llave : ruta+'.'+llave, original, objeto, debug);
			}
		};
		
		var asignar = function(dato, ruta, valor) {
			//console.log('asignando', ruta, valor)
			var llaves = ruta.split('.');
			var actual = dato;
			
			var validarEstructura = function(mobjeto, mllave) {
				if (!esNumero(mllave) && esLista(mobjeto)) {
					console.log('a una lista se le va a asignar ', mllave)
					//Convertir esa lista en un objeto
					var ans = {};
					iterarObjeto(mobjeto, function(ruta, valor, original, padre) {
						asignar(ans, ruta, valor);
					});
					return ans;
				}
			};
			
			for (var i=0; i<llaves.length; i++) {
				var llave = llaves[i];
				
				if (i == (llaves.length - 1)) {
					actual[llave] = valor;
				} else {
					if (!hayValor(actual[llave])) {
						//Si el siguiente es un número, se crea la lista
						var llaveNumero = esNumero(llaves[i+1]);
						if (llaveNumero) {
							actual[llave] = [];
						} else {
							actual[llave] = {};
						}
					} else {
						var temp = validarEstructura(actual, llave);
						if (esObjeto(temp)) {
							//actual debe remplazarce con temp, pero se debe acceder al papa de actual para asignarle actual
							actual[llave] = temp;
						}				
					}
					actual = actual[llave];
				}
			}
		}
		
		var recrear = function(dato) {
			return JSON.parse(JSON.stringify(dato));
		}
		
		var modoBasico = (function() {
		
			var to = function(objeto) {
				var destino = null;
				if (esLista(objeto)) {
					destino = [];
				} else {
					destino = {};
				}
				var listas = [];
				iterarObjeto(objeto, function(ruta, valor, original, padre) {
					//console.log(ruta, leer(original, ruta));
					var patron = /(\d+)\.([^\d]*)$/ig;
					var grupos = patron.exec(ruta);
					if (grupos != null) {
						var ruta2 = ruta.replace(patron, '');
						var unaLista = ruta2.replace(/\.$/ig, '');
						if (listas.indexOf(unaLista) < 0) {
							listas.push(unaLista);
						}
						//Se debe volar el último número .1. y asignar la propiedad como una lista
						ruta2+=grupos[2]+'.'+grupos[1];//nombre.número
						asignar(destino, ruta2, valor);
					} else {
						asignar(destino, ruta, valor);
					}
					
				}, null, null, null, false);
				
				var terminado = {};
				iterarObjeto(destino, function(ruta, valor, original, padre) {
					//console.log('ruta', ruta, valor)
					var llaves = Object.keys(terminado);
					if (esLista(padre)) {
						//Busco la ruta anterior
						var patron = /\.(\d+)$/ig;
						var ruta2 = ruta.replace(patron, '');
						if (llaves.indexOf(ruta2) < 0) {
							terminado[ruta2] = [];
						}
						terminado[ruta2].push(valor);
					} else {
						terminado[ruta] = valor;
					}
				}, null, null, null, false);
				asignar(terminado, '__listas__', listas);
				return terminado;
			};
			
			var from = function(objeto) {
			
			};
		
			return {
				'to': to,
				'from': from,
			}
		})();
		
		var modoSimple = (function() {
			
			var to = function(objeto) {
				var respuesta = {};
				
				var llaves = utilidades.darRutasObjeto(objeto);
				for (var i=0; i<llaves.length; i++) {
					var llave = llaves[i];
					respuesta[llave] = utilidades.leerObj(objeto, llave, null);
				}
				return respuesta;
			}
			
			var from = function(objeto) {
				var respuesta = {};
				var llaves = Object.keys(objeto);
				for (var i=0; i<llaves.length; i++) {
					var llave = llaves[i];
					var dato = objeto[llave];
					utilidades.asignarObj(respuesta, 'ans.'+llave, dato);
				}
				return respuesta['ans'];
			};		
			
			return {
				'to': to,
				'from': from,
			}
		})();

		var registrar = function(llave, valor) {
			modos[llave] = valor;
		};
		
		var modo = function(llave) {
			return modos[llave];
		};
		
		registrar('basico', modoBasico);
		registrar('simple', modoSimple);
		
	return {
		'registrar': registrar,
		'modo': modo,
	}
	})();
	
	utilidades = (function() {

		var is_null = function(valor) {
			return (valor === null || typeof valor === 'undefined');
		};

		var esNumero = function(dato) {
			return (typeof dato == 'number' || /^\d+$/.test(dato));
		};

		var esFuncion = function (functionToCheck) {
		  var getType = {};
		  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
		};

		var esLista = function(value) {
		  return (value!==null && value !==undefined && value instanceof Array);
		};

		var esObjeto = function(obj) {
		  return (obj!==null && obj !==undefined && ((typeof obj) == 'object'));
		};

		var copiarJSON = function(obj) {
		  return JSON.parse(JSON.stringify(obj));
		};

		var aBooleano = function(texto) {
		  if (!hayValor(texto)) {return null;}
		  if (texto == 'true') return true;
		  if (texto == 'false') return false;
		  return null;
		};

		var hayValor = function(obj) {
		  return (obj!==null && obj !==undefined);
		};

		var hayValorTexto = function(obj) {
			if (!hayValor(obj)) {
				return false;
			}
			if (typeof obj != 'string') {
				return false;
			}
			if (obj.trim().length == 0) {
				return false;
			}
			return true;
		}

	  var leerMapaConPredefinidos = function($entrada, $mapa) {
	  	$.each($mapa, function($llave, $valor) {
	      var $temp = $entrada[$llave];
	      if (is_null($temp)) {
	        var $predeterminado = $valor;
	        if (!is_null($predeterminado)) {
	          $entrada[$llave] = $predeterminado;
	        }
	      }
	  	});
	   
	    return $entrada;
	  };


		var esMultilenguaje = function(entrada) {
			return /^(\S)+(\.\S+)+$/gim.test(entrada)
		};

		function darNumeroAleatorio(min, max) {
		    return Math.floor(Math.random() * (max - min + 1)) + min;
		};

		function decimalAHex(d, padding) {
		    var hex = Number(d).toString(16);
		    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

		    while (hex.length < padding) {
		        hex = "0" + hex;
		    }
		    return hex;
		};

		var darHtmlCompleto = function(elem) {
			return $('<div>').append(elem.clone()).html();
		};

		var darHtmlSeguro = function(texto) {
			return $('<div>').html(texto).html();
		};

		var deHtmlDarSoloTexto = function(texto) {
			return $('<div>').html(texto).text();
		};

		var leerObj = function(obj, nombres, predef, evitarInvocar) {
			if (!hayValor(nombres) || !esObjeto(obj)){return predef;}
			var partes = nombres.split('.');
			var objetoActual = obj;
			for (let i=0; i<partes.length; i++) {
				var llave = partes[i];
				if (esNumero(llave) && esLista(objetoActual)) {
					llave = parseInt(llave);
				}
				objetoActual = objetoActual[llave];
				if (i != (partes.length - 1) && !esObjeto(objetoActual)) {
					return predef;
				}
			}
			if (!hayValor(objetoActual)) {
				return predef;
			}
			if (evitarInvocar !== true && esFuncion(objetoActual)) {
				return objetoActual();
			}
			return objetoActual;
		};

		var asignarObj = function(miObjeto, nombres, valor) {
			var partes = nombres.split('.');
			var objetoActual = miObjeto;
			for (var i=0; i<partes.length; i++) {
				var llave = partes[i];
				if (esNumero(llave)) {
					llave = parseInt(llave);
				}
				if (esObjeto(objetoActual)) {
					if (i == (partes.length-1)) {
						if (esLista(objetoActual[llave]) && esLista(valor) && objetoActual[llave] !== valor) {
							objetoActual[llave].splice(0, objetoActual[llave].length);
							$.each(valor, function(i, eee) {
								objetoActual[llave].push(eee);
							});
						} else {
							objetoActual[llave] = valor;
						}
					} else {
						if (Object.keys(objetoActual).indexOf(''+llave) < 0 || (objetoActual[llave] == null)) {
							if (esNumero(partes[i+1])) {
								objetoActual[llave] = [];
							} else {
								objetoActual[llave] = {};
							}
						}
						objetoActual = objetoActual[llave];
					}
				}
			}
		};

		var darSubrutas = function(llave) {
			var myRe = /([^\.]+)/ig;
			var lista = [];
			var todos = [];
			var result;
			while (result = myRe.exec(llave)) {
			    llave = llave.substring(myRe.lastIndex);
			    myRe.lastIndex = 0;
				todos.push(result[0]);
				lista.push(todos.join('.'));
			}
			return lista;
		};

		var darRutasObjeto = function(objOr, filtroObjetoAgregar) {
		  var ans = [];
		  var funcionRecursiva = function(obj, rutaActual) {
		    if (esObjeto(obj)) {
		      $.each(obj, function(llave, valor) {
		        var llaveSiguiente = null;
		        if (rutaActual === null) {
		          llaveSiguiente = llave;
		        } else {
		          llaveSiguiente = rutaActual+'.'+llave;
		        }
		        if (esFuncion(filtroObjetoAgregar) && filtroObjetoAgregar(valor)) {
		          ans.push(llaveSiguiente);
		        }
		        funcionRecursiva(valor, llaveSiguiente);
		      });
		    } else {
		      if (rutaActual !== null) {
		        if (esFuncion(filtroObjetoAgregar)) {
		          if (filtroObjetoAgregar(obj)) {
		            ans.push(rutaActual);
		          }
		        } else {
		          ans.push(rutaActual);
		        }
		      }
		    }
		  };

		  funcionRecursiva(objOr, null);
		  return ans;
		};

		var predefinir = function(objeto, ejemplo) {
			var llaves = darRutasObjeto(ejemplo);
			for (let i=0; i<llaves.length; i++) {
				let llave = llaves[i];
				if (!hayValor(leerObj(objeto, llave, null, true))) {
					let nuevo = leerObj(ejemplo, llave, null, true);
					asignarObj(objeto, llave, nuevo);
				}
			}
			return objeto;
		};

		return {
			'is_null':is_null,
			'esNumero': esNumero,
			'esFuncion': esFuncion,
			'esLista': esLista,
			'esObjeto': esObjeto,
			'copiarJSON': copiarJSON,
			'aBooleano': aBooleano,
			'hayValor': hayValor,
			'hayValorTexto': hayValorTexto,
			'leerMapaConPredefinidos': leerMapaConPredefinidos,
			'esMultilenguaje': esMultilenguaje,
			'darNumeroAleatorio': darNumeroAleatorio,
			'decimalAHex': decimalAHex,
			'darHtmlCompleto': darHtmlCompleto,
			'darHtmlSeguro': darHtmlSeguro,
			'deHtmlDarSoloTexto': deHtmlDarSoloTexto,
			'leerObj': leerObj,
			'asignarObj': asignarObj,
			'darSubrutas': darSubrutas,
			'darRutasObjeto': darRutasObjeto,
			'predefinir': predefinir,
		};
	})();

}(jQuery));

//Función que permite leer con predefinidos
var leer = function(dato, predefinido) {
	if (!utilidades.hayValor(dato)) {
		return predefinido;
	}
	return dato;
};

var leerObj = function(obj, llave, predefinido) {
	var dato = utilidades.leerObj(obj, llave, predefinido, true);
	if (!utilidades.hayValor(dato)) {
		return predefinido;
	}
	return dato;
};