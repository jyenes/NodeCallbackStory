# Callback Hell Story
Hace unos días intentaba convencer a uno de mis compañeros de trabajo de que probase Node como lenguaje de programación. Me sorprendió su respuesta: “Tío no me aclaro con la asincronía, los callbacks hacen que mi código sea una chapuza “. En ese momento me dí cuenta de todo lo que había avanzado Node.js a lo largo de las versiones, de modo que una persona que hubiese tenido contacto con node hace tiempo, podía tener una opinión diferente a la que tendría si esa misma prueba la hiciera ahora mismo.
Voy a intentar hacer un resumen histórico de cómo se manejan los callback para manejar la asincronía, y proporcionar algunas buenas prácticas y formas de organizar el código que nos ayuden a tener un código de calidad y que aproveche las capacidades que nos ofrecen las últimas versiones de Node.

Un poco de historia: 

Node.js es un framework de ejecución del lado del servidor que se base en javascript como lenguaje de interpretación de comandos. Los creadores de Node, utilizaron javascript ya que node se basa en la maquina V8 que google creó para interpretar este lenguaje en su navegador, chrome y se caracteriza por su velocidad y rendimiento.

Node.js surge como respuesta a la problemática con la programación secuencial tradicional. En lenguajes como Java que se basan en hilos de ejecución hay un máximo teórico que viene dado por la memoria que consume cada hilo de ejecución en la máquina en la que se despliega, de forma que si por ejemplo tenemos una máquina con 8GB de memoria ram y cada hilo consume 2 megas, tenemos un máximo teórico de 4000 usuarios concurrentes. En este tipo de arquitecturas el cuello de botella reside en la memoria de la máquina y para escalar hay que hacerlo añadiendo más máquinas.

La particularidad de Node.js reside en una pieza denominada EventLoop. Con el EventLoop Node.js es capaz de solventar el problema de la limitación de memoria, que comentamos anteriormente, consumiendo muy pocos recursos de la máquina y maximizando el rendimiento.


Node.js es single thread, este hilo de ejecución única es nuestro event loop, el event loop ejecuta nuestro código javascript y lo que hace es delegar las llamadas pesadas (entrada/salido) para que se procesen en segundo plano, de esta forma no bloqueamos el hilo de ejecución (non-blocking) mientras se está procesando, y lo que hace es apuntar la función que queremos ejecutar una vez que ese procesamiento offline termine (callback).

Desde un punto de vista más técnico, un componente de la máquina V8 denominado libuv genera un ThreadPool con 4 hilos para los procesos asíncronos, además el propio sistema operativo provee de interfaces asíncronas para procesamiento de entrada/salida.

Por otro lado el EventLoop tiene una cola donde va apuntando los callbacks que tiene ejecutar una vez que las operaciones asíncronas finalicen.

Una forma sencilla de entender que es el EventLoop es imaginar que el sistema es como un restaurante, en el que tenemos un único trabajador: un camarero. Nuestro camarero se encarga de sentar a la gente en la mesa y tomarles la orden de comida (tarea asíncrona) si el camarero tuviese que preparar la comida estaríamos bloqueando le para que pudiese atender a la siguiente mesa, en lugar de eso el camarero manda la orden a la cocina (threadPool) en la que uno de los cocineros la prepara, cuando ésta esté lista llamará al camarero para que lleve la comida a la mesa, nuestro camarero tiene apuntado la correspondencia entra la comida y el número de mesa para saber el sitio al que tiene entregar la comida (callback)


Callback Hell:
el callback Hell se produce cuando encadenamos muchas operaciones asíncronas seguidas.

```javascript
function getNames(callback) {
	setTimeout(function() {
	    console.log('han pasado 3 segundos');
	    callback(null, 'Lucas', 'Carlota');
	}, 3000);
}


function compoundSentence(name1, name2, callback) {
	console.log('componemos la frase: ');
	setTimeout(function() {
	    console.log('han pasado 2 segundos');
	    var sentence = name1 +' y '+ name2;
    	callback(null, sentence);
	}, 2000); 
}

function finalizeSentence(sentence, callback) {
	console.log('añadimos otra pieza la frase: ');
	setTimeout(function() {
	    console.log('han pasado 1 segundos');
	    sentence += ' son hermanos!';
    	callback(null, sentence);
	}, 1000); 
}

getNames(function (err, name1, name2){
     compoundSentence(name1, name2, function(err, sentence) {
        finalizeSentence(sentence, function(err, finalResult) {
            console.log(finalResult)
        })
     })
});
```


vamos a ver cómo Node.js gestiona esta problemática a lo largo de todas sus versiones.


Node v0.11
Node.js pasó una etapa bastante conflictiva en sus inicios, llegando incluso a recibir un fork (io.js) debido a conflictos en su gobierno, provocado principalmente ante la negativa a incorporar nativamente las mejoras que ECMASCRIPT iba lanzando. Por suerte esa etapa no duró mucho y nació node v4, como resultado de la fusion de node.js e io.js.
Por aquel entonces la forma de no caer en el tan temido callback-hell y que el código fuese ilegible, era utilizar librerías para controlar el flujo, de las más populares destaca async. 

Async nos proporciona métodos tales como waterfall, series, parallel que nos permitían ejecutar funciones en cascada, en serie o en paralelo respectivamente pasando los resultados obtenidos a la siguiente función.


Solución con async:

```javascript
var async = require('async');

async.waterfall(
    [
        function(callback) {
        	// operación síncrona que recurre un par de nombres
        	setTimeout(function() {
			    console.log('han pasado 3 segundos');
			    callback(null, 'Lucas', 'Carlota');
			}, 3000);
        },
        function(name1, name2, callback) {
        	console.log('componemos la frase: ');
        	setTimeout(function() {
			    console.log('han pasado 2 segundos');
			    var sentence = name1 +' y '+ name2;
            	callback(null, sentence);
			}, 2000); 
        },
        function(sentence, callback) {
        	console.log('añadimos otra pieza la frase: ');
        	setTimeout(function() {
			    console.log('han pasado 1 segundos');
			    sentence += ' son hermanos!';
            	callback(null, sentence);
			}, 1000); 
        }
    ],
    function (err, sentence) {
        console.log(sentence);
    }
);
```


Node V4
A partir de ésta versión de node llegaron las tan ansiadas promesas, una promesa es un objeto que representa la evaluación en forma de éxito o fracaso de una operación asíncrona, si bien es cierto que el uso de promesas es anterior a esta versión mediante el uso de librerías como promisify, desde la versión 4 se introducen de forma nativa.
Solución con Promesas:

Solución con Promesas: 

```javascript
function getNames() {
	return new Promise((resolve, reject) => {
		setTimeout(function() {
		    console.log('han pasado 3 segundos');
		    resolve('Lucas', 'Carlota');
		}, 3000);
	});	
}

function compoundSentence(name1, name2) {
	return new Promise ((resolve, reject) => {
		console.log('componemos la frase: ');
		setTimeout(function() {
		    console.log('han pasado 2 segundos');
		    var sentence = name1 +' y '+ name2;
	    	resolve(sentence);
		}, 2000); 
	});
}

function finalizeSentence(sentence, callback) {
	return new Promise ((resolve, reject) => {
		console.log('añadimos otra pieza la frase: ');
		setTimeout(function() {
		    console.log('han pasado 1 segundos');
		    sentence += ' son hermanos!';
	    	resolve(sentence);
		}, 1000); 
	});
}

getNames()
	.then((name1, name2) => {
		return compoundSentence(name1, name2)
	})
    .then((sentence) => {
    	return finalizeSentence(sentence)
    })
    .then((finalResult) => {
    	console.log(finalResult)
    })
    .catch((err) => console.log(err));
```

Ahora es bastante más legible seguir el flujo de la ejecución de getNames 


Node v6
Con la versión 6 de node podemos hacer uso de las funciones generadoras y de la palabra reservada yield. Una de las cosas que más se echaban era poder parar la ejecución de una promesa, de forma que se pudiese programar de forma secuencial. Lo que nos permite hacer esta combinación es parar la ejecución de una promesa esperando para continuar cuando la promesa sea resuelta, lo que hace que podamos programar de un modo más secuencial y que el código sea más fácilmente entendible

solución con funciones generadoras y yield:

```javascript
const co = require('co');

function getNames() {
	return new Promise((resolve, reject) => {
		setTimeout(function() {
		    console.log('han pasado 3 segundos');
		    resolve(['Lucas', 'Carlota']);
		}, 3000);
	});	
}

function compoundSentence(names) {
	return new Promise ((resolve, reject) => {
		console.log('componemos la frase: ');
		setTimeout(function() {
		    console.log('han pasado 2 segundos');
		    var sentence = names[0] +' y '+ names[1];
	    	resolve(sentence);
		}, 2000); 
	});
}

function finalizeSentence(sentence) {
	return new Promise ((resolve, reject) => {
		console.log('añadimos otra pieza la frase: ');
		setTimeout(function() {
		    console.log('han pasado 1 segundos');
		    sentence += ' son hermanos!';
	    	resolve(sentence);
		}, 1000); 
	});
}

co(function* () {
	let names = yield getNames();
	let sentence = yield compoundSentence(names);
	let finalResult = yield finalizeSentence(sentence);
	console.log(finalResult);
})
.catch(error => console.log(error)); 
```

la complejidad aquí es el uso de las funciones generadoras, y que este tipo de código se suele usar junto con un módulo llamado co (https://github.com/tj/co) que es un controlador del flujo para funciones generadoras.


Node v8
Con esta versión llega ASYNC/AWAIT para dar una vuelta a la funcionalidad anterior que, pese a ser efectiva, resultaba un tanto complicada ya que usaba funciones generadoras y el uso de módulos externos como co.

Solución con ASYNC/AWAIT:

```javascript
async function getNames() {
	return new Promise((resolve, reject) => {
		setTimeout(function() {
		    console.log('han pasado 3 segundos');
		    resolve(['Lucas', 'Carlota']);
		}, 3000);
	});	
}

async function compoundSentence(names) {
	return new Promise ((resolve, reject) => {
		console.log('componemos la frase: ');
		setTimeout(function() {
		    console.log('han pasado 2 segundos');
		    var sentence = names[0] +' y '+ names[1];
	    	resolve(sentence);
		}, 2000); 
	});
}

async function finalizeSentence(sentence) {
	return new Promise ((resolve, reject) => {
		console.log('añadimos otra pieza la frase: ');
		setTimeout(function() {
		    console.log('han pasado 1 segundos');
		    sentence += ' son hermanos!';
	    	resolve(sentence);
		}, 1000); 
	});
}

let names = await getNames();
let sentence = await compoundSentence(names);
let finalResult = await finalizeSentence(sentence);
console.log(finalResult);
```

como ves, es un wrapper sobre la anterior solución, pero que hace que sea más entendible y que tengamos más limpio nuestro código y sobre todo eliminamos la necesidad de usar un módulo externo como co.

A partir de la versión 8, han llegado las versiones 9 y 10 pero no aportan nada nuevo en la problemática que hemos tratado.

Como has podido ver Node.js ha ido evolucionando mucho en muy poco tiempo, y lo seguirá haciendo para facilitarnos la vida y que sea más simple, gracias a la increíble comunidad que hay detrás de Node.js ésta evolución está garantizada.

Esto no quiere decir que las versiones anteriores sean incorrectas y que nos tengamos que volver locos a refactorizar nuestro código, pero tenemos que ser conscientes de que hay nuevas formas de hacer las cosas que harán que nuestro código luzca mejor y es importante estar al tanto de estas mejoras, e ir actualizando las versiones más antiguas para que nuestro código sea más mantenible.

Destacaría por otro lado que debido a todas evoluciones y cambios de versiones que hemos vivido en los últimos años, Node.js ha alcanzado un grado de madurez óptimo para su uso, por lo que te animo tanto si has probado Node.js en el pasado como si estás pensando hacerlo a que le des una oportunidad y veas la facilidad de uso y la potencia que tiene.

