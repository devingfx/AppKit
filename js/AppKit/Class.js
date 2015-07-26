/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function Class(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the construct constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          var sup = function _super_() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
          sup = eval( '('+ sup.toString().replace('_super_', fn.name) +')' );
          return sup;
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    var Class = function Class() {
    	// All construction is actually done in the construct method
    	if ( !initializing && this.construct )
    	{
      		this.construct.apply(this, arguments);
      		//console.html('<info>CLASS</info>');
   		}
    }
    Class = eval('('+ Class.toString().replace('function Class()', 'function '+prototype.construct.name+'()') +')' );
    //console.log( Class );

    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    //Class.prototype.construct = function(){console.html('<log level="instance">Class <span c="class core">Class</span></log>')}
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();
