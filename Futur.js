/**
 *
 * Lightweight promises implementation
 *
 * // Usage example :
 * 
 * var futur = new Futur;
 * var storyId = 1337; 
 *
 * futur.do( beginTransaction )
 *      .then( createPost ).as('post')
 *      .then( manageTags ).using('post').with(req.body.tags)
 *      .then( publishToTwitter ).using('post')
 *      .then( commit )
 *      .now();
 * 
 * // futur.inject() Example :
 *
 * myCallback = function(futur, foo, bar){
 *
 *  if ( bar ) {
 *      futur.inject( anotherCallback ).with( foo ).now();
 *  } else {
 *      futur.next();
 *  }
 * }
 *
 */
Futur = function(){

    this.stack  = [];
    this.data   = {};
    this.key    = null;
    this.state  = 0;

    /**
     * Get and store result from current stack item
     *
     * @param mixed data
     */
    this.send = function(data){
        if ( this.key ) {
            this.data[this.key] = data;
        }
        this.next();
    };

    /**
     * Mapping for express json API routes
     *
     * @param mixed data
     **/
    this.json = function(data){
       this.send(data);
    };

    /**
     * Launch net item in stack
     */
    this.next = function(){
        this.state = 1;
        if ( this.stack.length > 0 ){
            callback = this.stack.shift();
            
            this.key = callback.key;

            this.processDynArgs(callback.args);

            callback.args.unshift(this);

            callback.call.apply(null, callback.args);
        }
    }

    this.processDynArgs = function(args){
        for(var i=0; i<args.length; i++){

            if ( args[i] instanceof Object && args[i].constructor.name == 'DynArg' ){
                args[i] = args[i].read();
            }
        }

        return args;
    }

    /**
     * Get data from results storage
     *
     * @param String key : A storage key
     * @return mixed : Stored data if any
     */
    this.get = function(key){
        return this.data[key];
    };

    /**
     * Alias for first `then` call
     *
     * @param Function : Fuction to call
     * @return self;
     */
    this.do = function(method){
        return this.then(method);
    };

    /**
     * Add a callback to the stack
     *
     * @param Function : Fuction to call
     * @return self;
     */
    this.then = function(method){

        this.stack.push( {call: method, args: [], key: null } );

        return this;
    };

    /**
     * Injects a callback in the beggining of the stack
     * Tipically to be used from within the execution of the stack
     *
     * @param Function
     * @return self
     */
    this.inject = function(method){
        this.stack.unshift( {call: method, args: [], key: null } );

        return this;
    };

    /**
     * Get item being defined in the stack when defining
     * OR
     * next item to be executed when execution started
     *
     * @return Object : (POJO) call definition
     */
    this.current = function(){
        if ( this.state == 0 ){
            return this.stack[this.stack.length-1];
        } else {
            return this.stack[0];
        }
    };


    /**
     * Set a storage key for current callback result
     *
     * @param String key : The key to store result as
     * @return self
     */
    this.as = function(key){
        this.current().key = key;
        return this;
    };

    /**
     * Set static arguments for the call
     * (appended to existings arguments)
     *
     * @param Uhu ? Dinamic parameters...
     * @return self
     */
    this.with = function(){
        for (i=0; i<arguments.length; i++){
            this.current().args.push(arguments[i]);
        }
        return this;
    };

    /**
     * Gives a data stored as argument
     * (appended to existings arguments)
     * Data corresponding to argument key 
     * is dynamically fetched and passed to called method
     *
     * @param String key
     * @return self
     */
    this.using = function(){
        for (i=0; i<arguments.length; i++){
            this.current().args.push(this.dynamicArg(arguments[i]));
        }
        return this;
    }

    /**
     * Launch process by executing next();
     */
    this.now = function(){
        this.next();
    };

    /**
     * Register a `dynamic arg`
     * Given parameter is encapsulated into a specific object
     * which type will trigger data retrieval on execution time
     *
     * @param String key
     * @return Object DynArg
     */
    this.dynamicArg = function(key){
        self = this;

        function DynArg(key){
            this.read = function(){
                return self.data[key];
            }
        }
        return new DynArg(key);
    };


    return this;
};



module.exports = Futur;

