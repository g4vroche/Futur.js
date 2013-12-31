Futur.js
========

Lightweight futures/promises implementation in javascript.

Allows you to chain function calls and using data provided by already executed functions of the stack.






Usage examples :
---
 
```javascript

createPost = function(futur, postData){

    // Insert stuff in database and when done return a json object "post"
    // post = {id: insertID, title:... }
    
    insertPostInDB(postData, function(post){
        futur.send( post );
    });
}

manageTags = function(futur, post, tags){

    // insert association in database for tags array and "post.id"
    
    insertTagsInDB(tags, post.id, function(){
        futur.next();
    });
}



var futur = new Futur;

futur.do( beginTransaction )
    .then( createPost ).as('post')
    .then( manageTags ).using('post').with(req.body.tags)
    .then( commit )
    .then( publishToTwitter ).using('post')
    .now();
```
 
futur.inject() Example :
----

```javascript
myCallback = function(futur, foo, bar){

  if ( bar ) {
    futur.inject( anotherCallback ).with( foo ).now();
  } else {
    futur.next();
  }
}
```

Usable function definition
----

Functions should expect an instance of Futur as their first argument.

Functions should call [next](#next), [send](#send) or [json](#json) when their task is done, to allow the stack to be executed.


Method summary
---

Stack definition :
###

* [do](#do)
* [then](#then)
* [now](#now)
* [as](#as)
* [with](#with)
* [using](#using)


Inside the functions
###
* [inject](#inject)
* [get](#get)
* [next](#next)
* [send](#send)
* [json](#json)

**********

<a name="do"></a>
##### do(  `Function` function )

Alias of [then](#then), for nicer declaration.


<a name="then"></a>
##### then(  `Function` function )

Appends a Function in the stack, and 'set it' as the currently defined method.

Example :

```javascript

foo = function(futur, a){
    futur.send(a);
}

bar = function(futur, a){
    console.log(a);
    futur.next();
}

var futur = new Futur;

futur.do( foo )
   .then( bar )
   .now();
   
```

<a name="now"></a>
##### now()

Triggers the stack execution by emitting the first call to `futur`.[next()](#next)



<a name="as"></a>
##### as( `String` key )

Tells `Futur` to store result of currently defined method in its internal storage, associated with a key  "key"

<a name="with"></a>
##### with( arg1, arg2, arg3, ...)

Tells `Futur` to pass given arguments as argument of the currently defined method.
Arguments will be passed in the same order.

May be called seerals times.

Exemple:

```javascript
futur.do( foo ).with("I am foo")
   .then( bar ).with("I am bar")
   .now();
   
// Outputs "I am bar" in console

```


<a name="using"></a>
##### using( `String` key )

Tells `Futur` to use the data stored in its internal storage, associated with the key "key", as argument for the currently defined method.

Data will be retrieved at call time, allowing you to use data provided by a previous method in the stack.

Exemple :
```javascript
futur.do( foo ).as('first_call_data') .with("I am foo");
   .then( bar ).using("first_call_data")
   .now();
   
// Outputs "I am foo" in console
```

<a name="inject"></a>
##### inject( `Function` function )

Prepends a function call to the stack, as the "next to be executed" item.
.inject() works from inside called functions and is usefull to add a conditional treatment.

Exemple : 

```javascript 
foo = function(futur){
    console.log("foo");

    futur.inject(blah);

    futur.next();
}

bar = function(futur){
    console.log("bar");
    futur.next();
}

blah = function(futur){
    console.log("blah");
    futur.next();
}

futur.do( foo )
   .then( bar )
   .now();

// Output in console :
 foo
 blah
 bar


``` 

<a name="get"></a>
##### get( `String` key )

Returns data storred in internal storage for associated key "key" if any.


<a name="next"></a>
##### next()

Executes the next call in the stack


<a name="send"></a>
##### send( data )

Stores data in internal storage with current call's key, then triggers futur.[next()](#next);

<a name="json"></a>
##### json( data )

Alias of [send](#send)



