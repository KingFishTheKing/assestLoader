function loadfile() {
    let scriptQeue = [];
    //Helper functions
    function buildTag(scriptObject){
        return new Promise((resolve, reject) => {
                try{
                    let script = document.createElement('script');
                    script.src = scriptObject.path;
                    scriptObject.id ? script.id = scriptObject.id : null;
                    scriptObject.class ? script.classList.add(scriptObject.class) : null;
                    scriptObject.async ? script.async = "async" : null;
                    scriptObject.defer ? script.defer = "defer" : null;
                    script.onload = function(){
                        typeof scriptObject.callback === 'function' ? scriptObject.callback() : null;
                    };
                    script.onerror = function(){
                        this.parentNode.removeChild(this);
                    }
                    document.head.appendChild(script) === script ? resolve(true) : reject(false);
                }
                catch(err){
                    reject(err)
                }
            }
        ).catch(e => {
            return e
        })
    }
    //Script generator
    function* scriptGenerator(){
        yield* scriptQeue
    }

    //Async eecute functions
    async function execute(scriptImport){
        let promise = Promise
            .all(scriptImport)
            .then(
                (values) => {
                    return new Promise((resolve, reject) => {
                        values.reduce((a, b) => {
                            return a + b;
                        }) === values.length ? resolve(true) : reject(false)
                    })        
                }
            )
        let result = await promise;
        return result
    }
    async function executeQueu(){
        let internalIndex = 0;
        let executeQueu = [];
        for await (const next of scriptGenerator()){
            switch(next[0]){
                case 'script':
                    executeQueu.push(buildTag(next[1]))
                    break;
                case 'wait':
                default:
                    await execute(executeQueu).finally(() => {
                        executeQueu = [];
                    });
                    break;
            }
            if (internalIndex++ == scriptQeue.length) var result = true
        }
        return await result;
    }

    //Public functions
    function script(scriptPath, optionsOrCallback = {}) {
        let def = {
            path: scriptPath,
            id: optionsOrCallback.id || null,
            class: optionsOrCallback.class || null,
            inline: optionsOrCallback.inline || false,
            async: optionsOrCallback.async || false,
            defer: optionsOrCallback.defer || false,
            module: optionsOrCallback.module || false,
            callback: optionsOrCallback.callback || null
        };
        if (typeof optionsOrCallback === 'function') {
            def.callback = optionsOrCallback;
        }
        scriptQeue.push(['script', def]);
        return this;
    };
    function wait() {
        scriptQeue.push(['wait'])
        return this;
    };
    function done(callbackSuccess = null, callbackFail = null) {
        if (typeof callbackSuccess === 'function'){
            executeQueu().then(
                (done, err) => {
                    if (err) typeof callbackFail === 'function' ?  callbackFail(err) : null;
                    else {
                        scriptQeue = [];
                        callbackSuccess(done)
                    }
                }    
            ).catch(
                e => typeof callbackFail === 'function' ?  callbackFail(e) : null
            )
        }
        else{
            return new Promise((resolve, reject) => {
                executeQueu().then(
                    (done, err) => {
                        if (err) reject(err)
                        else {
                            scriptQeue = [];
                            resolve (done)
                        }
                    }
                ).catch(
                    e => reject(e)
                )
            })
        }
    };
    
    return ({
        'script' : script,
        'wait' : wait,
        'done' : done
    })
}
