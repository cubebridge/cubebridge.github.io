
var DEBUG = true;

function log(...msg){
    if(DEBUG)
	return console.log(...msg);
}

async function sleep (time) {
  log('sleep',time);
  return new Promise((resolve) => setTimeout(resolve, time));
}

function toDatetime(t){
    //log('toDatetime',t);
    return new Date(t*1000).toLocaleString();
}
