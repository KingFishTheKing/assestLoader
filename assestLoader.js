function loadfile() {
    let scriptQeue = [];
    //Helper functions
    function buildTag(scriptObject){
        return new Promise((resolve, reject) => {
                    let script = document.createElement('script');
                    script.src = scriptObject.path;
                    script.type = scriptObject.type;
                    scriptObject.id ? script.id = scriptObject.id : null;
                    scriptObject.class ? script.classList.add(scriptObject.class) : null;
                    scriptObject.async ? script.async = "async" : null;
                    scriptObject.defer ? script.defer = "defer" : null;
                    script.addEventListener('load' ,function(){
                        resolve(scriptObject)
                        typeof scriptObject.callback === 'function' ? scriptObject.callback() : null;
                    });
                    script.onerror = function(){
                        this.parentNode.removeChild(this);
                    }
                    document.head.appendChild(script) !== script ? reject(false) : null;
            }
        ).catch(
            (e) => { return e }
        )
    }
    //Async execute functions
    async function execute(scriptImport){
        let promise = Promise
            .all(
                scriptImport.map(s => {
                    return buildTag(s)
                })    
            )
            .then(
                (values) => {
                    return new Promise((resolve, reject) => {
                        values.reduce((a, b) => {
                            return b ? a+1 : a;  
                        }, 0) === values.length ? resolve(values.filter(s => {
                            return s 
                        })) : reject(false)
                    }).catch( (e) => { return e } )   
                }
            ).catch(
                (e) => { return e}
            )
        let result = await promise;
        return result
    }
    async function executeQueu(){
        let internalIndex = 0;
        let executeQueu = [];
        let executedQeue = [];
        let waitQueu = [];
        function cleanUpAfterExecute(done, err){
            if (!err){
                executeQueu = [];
                executedQeue.push(...done.map(o => {
                    return o.path 
                }));
                waitQueu.forEach(w => {
                    if (found = executedQeue.find(e => {
                        return e == w.for
                    })){
                        execute([w.execute]).then(
                            waitQueu.slice(waitQueu.findIndex(w), 1)
                        )
                    }
                })
            }
        }
        while (internalIndex < scriptQeue.length){
            let next = scriptQeue[internalIndex]
            switch(next[0]){
                case 'script':
                    executeQueu.push(next[1]);
                    internalIndex++;
                    break;
                case 'waitFor':
                    waitQueu.push({
                        for: next[1],
                        execute: executeQueu.pop()
                    })
                    internalIndex++;
                    break;
                case 'wait':
                    execute(executeQueu)
                        .then((done, err) => cleanUpAfterExecute(done, err))
                        .catch( e => {
                            return e; 
                        })
                        .finally(internalIndex++);
                    break;
            }
            if (internalIndex == scriptQeue.length){
                //Force one last check to make sure all script have been pushed
                execute(executeQueu)
                    .then((done, err) => cleanUpAfterExecute(done, err))
                    .catch( e => {
                        return e; 
                    })
                var result = true
            }
        }
        return await result;
    }

    //Public functions
    function script(scriptPath, optionsOrCallback = {}) {
        //Adds script to the queu ti be processed
        let def = {
            path: scriptPath,
            id: optionsOrCallback.id || null,
            class: optionsOrCallback.class || null,
            inline: optionsOrCallback.inline || false,
            async: optionsOrCallback.async || false,
            defer: optionsOrCallback.defer || false,
            type: optionsOrCallback.type || 'text/javascript',
            callback: optionsOrCallback.callback || null
        };
        if (typeof optionsOrCallback === 'function') {
            def.callback = optionsOrCallback;
        }
        scriptQeue.push(['script', def]);
        return this;
    };
    function wait() {
        //Wait for all previously added scripts the be loaded before continuing
        scriptQeue.push(['wait'])
        return this;
    };
    function waitFor(thisScript){
        //Bind script to wait for another (specific) script being loaded before being started
        if (typeof thisScript !== 'string'){
            scriptQeue.push(['wait']);
        }
        else{
            scriptQeue.push(['waitFor', thisScript])
        }
        return this;
    }
    function done(callbackSuccess, callbackFail) {
        if (typeof callbackSuccess === 'function'){
            executeQueu().then(
                (done, err) => {
                    if (err) {
                        typeof callbackFail === 'function' ?  callbackFail.call(this, err) : null;
                    }
                    else {
                        scriptQeue = [];
                        callbackSuccess.call(this, done)
                    }
                }    
            ).catch(
                (e) => {
                    typeof callbackFail === 'function' ?  callbackFail.call(this, e) : null
                }
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
        'waitFor': waitFor,
        'done' : done
    })
}
