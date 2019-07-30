function loadfile() {
    var scriptQeue = [

    ];
    function script(scriptPath, optionsOrCallback) {
        if (typeof optionsOrCallback === 'function') {
            
        }
        else if (typeof optionsOrCallback === 'object') {
            
        }
        else {

        }
        return this;
    };
    function wait() {
        console.log('waiting');
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

loadfile().script("/script/bundle/minify/?event@2.0.0&ui@1.0.0", {
    id: 'plop',
    class: 'dynamicScript',
    async: true,
    defer: true,
    callback: console.log
})
