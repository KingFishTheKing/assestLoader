function loadfile() {
    let scriptQeue = [];

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
    function script(scriptPath, optionsOrCallback = {}) {
        let def = {
            path: scriptPath,
            id: optionsOrCallback.id || null,
            class: optionsOrCallback.class || null,
            inline: optionsOrCallback.inline || false,
            async: optionsOrCallback.async || false,
            defer: optionsOrCallback.defer || false,
            callback: optionsOrCallback.callback || null
        };
        if (typeof optionsOrCallback === 'function') {
            def.callback = optionsOrCallback;
        }
        scriptQeue.push(buildTag(def));
        return this;
    };
    function wait() {
        Promise
            .all(scriptQeue)
            .then(
                scripts => {
                    console.log(scripts)
                }
            )
        return this;
    };
    function done() {
        console.log('done');
        return this;
    };
    return ({
        'script' : script,
        'wait' : wait,
        'done' : done
    })
}
