
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
     			
        