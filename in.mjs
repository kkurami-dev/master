function read1(input, out){
  out.a = input.a + input.b + 1;
  input.a = 2;
}

function read2(input, out){
  const {a, b} = input;
  out.a = a - b;
}

function read3(input, out){
  const {a, b, x = 2} = input;
  out.a = a + b + x;
}

function read4({a:x , b}, out){
  const a = 3;
  out.a = a + b + x;
}

function main(func, ev, no){
  const out = {};
  func( ev, out );
  console.log(func.name, "out =", out.a);
}

export const handler = async (event) => {
  main(read1, event);
  main(read2, event);
  main(read3, event);
  main(read4, event);
};

// handler({ a: 1, b: 1 }) // とした場合の出力はどの様になるか
//   out = ?
//   out = ?
//   out = ?
//   out = ?
