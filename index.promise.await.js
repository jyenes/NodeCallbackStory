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
        