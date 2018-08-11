var async = require('async');

async.waterfall(
    [
        function(callback) {
        	// operación síncrona que recure un par de nombres
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