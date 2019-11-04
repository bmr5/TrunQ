import keyedQueries from './keyedQueries'
import parser from './parser'
import layerQueryFields from './layerQueryFields'
import queryObjectBuilder from './queryObjectBuilder'

const trunQify = (query, uniques, limits, endpointName) => {
    let cachedResults = []
    let trunQKey = {}
    let fetchedPromises = [];
    // get unique keys based on query, use these keys to check against local cache
    const keyedQueriesArray = keyedQueries(query, uniques, limits);
    for (let i = 0; i < keyedQueriesArray.length; i += 1) {
        let currentKey = Object.keys(keyedQueriesArray[i])
        let cachedResult = sessionStorage.getItem(currentKey)
        if (cachedResult !== null) {
            cachedResults.push(JSON.parse(cachedResult))
        }
        else {
            trunQKey[currentKey] = keyedQueriesArray[i][currentKey];
        }
    }

    //if the length is greater than 0 that means we have keys to go fetch because they weren't in cache (trunQKey holds not found items)
    if (Object.keys(trunQKey).length > 0) {
        //for Each of the keys that we need to go fetch, we create a promise to then push into an array - the goal is to run promise.all() later
        Object.keys(trunQKey).forEach(key => {
            //declare the promise to be pushed - it returns the result of a fetch
            let fetchingPromise = new Promise (function (resolve, reject) {
                fetch(endpointName, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query: trunQKey[key] })
                })
                .then(res => res.json())
                .then(res => {
                    sessionStorage.setItem(key, JSON.stringify(res))
                    return resolve(res);
                })
            })
            fetchedPromises.push(fetchingPromise)
        })
    }
    else {
        return cachedResults;
    }

    console.log("CACHED RESULTS", cachedResults, "\n\nTRUNQKEY", trunQKey)

    for (let j = 0; j < Object.keys(cachedResults).length; j += 1) {
        fetchedPromises.push(cachedResults[Object.keys(cachedResults)[j]])
    }

    return Promise.all([...fetchedPromises])
    .then(function(values) {
        return values;
    })
    .catch(err => {
        console.log(err);
    })
   
} 

export default trunQify  



    // if (Object.keys(trunQKey)) {
    //     fetch(endpointName, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify({ trunQKey: trunQKey })
    //     })
    //     .then(res => res.json())
    //     .then(res => {
    //         return Object.values(cachedResults).length !== 0 ? res + cachedResults : res
    //     })
    // }