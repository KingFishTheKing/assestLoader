function loadfile() {
    let scriptQeue = [];
    //Helper functions
    function buildTag(scriptObject){
        return new Promise((resolve, reject) => {
                try{
                    let script = document.createElement('script');
                    script.src = scriptObject.path;
                    script.type = scriptObject.type;
                    scriptObject.id ? script.id = scriptObject.id : null;
                    scriptObject.class ? script.classList.add(scriptObject.class) : null;
                    scriptObject.async ? script.async = "async" : null;
                    scriptObject.defer ? script.defer = "defer" : null;
                    script.addEventListener('load' ,function(){
                        resolve(true);
                        typeof scriptObject.callback === 'function' ? scriptObject.callback() : null;
                    });
                    script.onerror = function(){
                        this.parentNode.removeChild(this);
                    }
                    document.head.appendChild(script) !== script ? reject(false) : null;
                }
                catch(err){
                    (e) => { return e }
                }
            }
        ).catch(e => {
            (e) => { return e }
        })
    }
    //Async execute functions
    async function execute(scriptImport){
        let promise = Promise
            .all(scriptImport)
            .then(
                (values) => {
                    return new Promise((resolve, reject) => {
                        values.reduce((a, b) => {
                            return a + b;
                        }) === values.length ? resolve(true) : reject(false)
                    }).catch( (e) => { return e } )       
                }
            ).catch(
               (e) => { return e }
            )
        let result = await promise;
        return result
    }
    async function executeQueu(){
        let internalIndex = 0;
        let executeQueu = [];
        var result;
        while (internalIndex < scriptQeue.length){
            let next = scriptQeue[internalIndex]
            switch(next[0]){
                case 'script':
                    executeQueu.push(buildTag(next[1]));
                    internalIndex++;
                    break;
                case 'wait':
                default:
                    execute(executeQueu)
                        .then(() => {
                            executeQueu = [];
                        })
                        .catch( e => {
                            return e; 
                        })
                        .finally(internalIndex++);
                    break;
            }
            if (internalIndex == scriptQeue.length){
                result = true
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
    function waitForLoad(ofThisScript){
        //Bind script to wait for another (specific) script being loaded before being started
        if (typeof ofThisScript !== 'string'){
            scriptQeue.push(['wait']);
        }
        scriptQeue.push(['waitFor', ofThisScript])
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
        'waitForLoad': waitForLoad,
        'done' : done
    })
}
