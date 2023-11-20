
const DATA = {
};

export function setData(str){
  DATA.id = str;
}

export function getData(){
  return DATA.id;
}

export function Sleep(wait, cb){
  return new Promise((resolve)=>{
    const timerObj = setTimeout(() => {
      clearTimeout(timerObj);
      if(cb) cb();
      resolve();
    }, wait, 'funky');
  });

  // このままにしておくと、
  // タイムアウトがプログラムの終了を妨げる唯一のものになるので、
  // このステートメントで上記のタイムアウトを実行しないようにします。
  //clearTimeout(timerObj);
}

