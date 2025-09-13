//TW2.2.1:

export function resolvePromise(prms, promiseState){
  promiseState.promise = prms; //record prms
  promiseState.data = null; // clear the previous data
  promiseState.error = null; // clear the previous error

  if (!prms) return; // in case of empty promise

  function successACB(result){
    if(promiseState.promise === prms)
      promiseState.data = result;
  }
  function failureACB(result){
    if(promiseState.promise === prms)
      promiseState.error = result;
  }

  prms.then(successACB).catch(failureACB);
  
}