## Functions

<dl>
<dt><a href="#toObject">toObject(parent)</a> ⇒ <code>Object</code></dt>
<dd><p>Converts a state-ified object back into a normal JS object</p>
</dd>
<dt><a href="#setIgnore">setIgnore(toIgnore)</a></dt>
<dd><p>Sets a non-enumerable &quot;ignore&quot; property on an object which specifies that the field should never be treated as a &quot;state&quot;</p>
</dd>
<dt><a href="#STATEIFY">STATEIFY(parent, isArray)</a> ⇒ <code>Object</code></dt>
<dd><p>Converts an object into an immutable &quot;state&quot; object which will never be directly manipulated but instead creates a new copy as necessary when a set, delete or get trap is triggered</p>
</dd>
</dl>

<a name="toObject"></a>

## toObject(parent) ⇒ <code>Object</code>
Converts a state-ified object back into a normal JS object

**Kind**: global function  
**Returns**: <code>Object</code> - A JS object converted from state-ified object  

| Param | Type | Description |
| --- | --- | --- |
| parent | <code>Object</code> | An state-ified object that should be converted |

<a name="setIgnore"></a>

## setIgnore(toIgnore)
Sets a non-enumerable "ignore" property on an object which specifies that the field should never be treated as a "state"

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| toIgnore | <code>Object</code> | An object that should never be converted into a state |

<a name="STATEIFY"></a>

## STATEIFY(parent, isArray) ⇒ <code>Object</code>
Converts an object into an immutable "state" object which will never be directly manipulated but instead creates a new copy as necessary when a set, delete or get trap is triggered

**Kind**: global function  
**Returns**: <code>Object</code> - Returns a "state" object which is a Proxy that indirectly accesses a copy of the initial object  

| Param | Type | Description |
| --- | --- | --- |
| parent | <code>Object</code> | The object to be converted |
| isArray | <code>Boolean</code> | Specifies that the object being converted is an Array. Must be true in order to properly handle arrays as they will be converted into non-iterable objects if isArray argument is not specified |

