
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
})