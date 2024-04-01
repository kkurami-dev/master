const paramMap = {
  a:[{
    a: 1,
    b: "2",
    c: [1, 2],
    d: {
      e:1
    }
  },
  {
    a: 2,
    b: "3",
    c: [4, 5],
    d: {
      e:6
    }
  }],
};
function mockFunc(key, param, callback){
  const is_type = (a) => {
    if( Array.isArray( a ) ) return "arr";
    if( "object" === typeof a ) return "map";
    return "prim";
  }

  const arr_main = paramMap[ key ];
  const mode_app = [{a:paramMap[ key ], b:param}];

  while(arr_main.length > 0){
    const {f, a, b} = mode_app[ mode_app.length - 1];
    const k = f.pop();
    if( k === null ) {
      mode_app.pop();
      continue;
    }

    const obj_a = a[ k ];
    if( !b[ k ] ) return false;

    const type = is_type( obj_a );
    if( type !== is_type( b[ k ] ) ) return false;

    const obj_b = b[ k ];
    if( type === "prim" && obj_a === obj_b ) continue;

    arr_main.push( null, ...Object.keys(obj_a) );
    mode_app.push({ a:obj_a, b:obj_b});
  }
  return true;
}
