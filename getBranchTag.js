// 現在のブランチのタグを昇順に一番大きいものから２つ取得する
const { spawn, execSync } = require('node:child_process');
const controller = new AbortController();

// タグ一覧から現在のブランチのタグを検索するため、現在のブランチ名を取得
const nowBranch = execSync('git rev-parse --abbrev-ref @')
      .toString().replace(/\r?\n/g, '');

const printOut = [];

// 降順にタグ一覧を取得
//exec('git tag --sort -v:refname -n', (err, stdout, stderr) => {
const child = spawn('git', ['tag', '--sort',  '-v:refname', '-n']);

child.on('err', (err) => {
  controller.abort();
  throw new Error(err);
});

child.on('data', (stdout)=>{
  if( printOut.length === 2 ) {
    controller.abort();
    return;
  }

  const line = stdout.split(/\n/);
  for(let i = 0; i < line.length; i += 1){
    const tag = line[ i ].replace(/\r?\n/g, '');
    if(!tag) return;

    // タグのコミットハッシュを取得
    const sstdout = execSync(`git rev-parse ${tag}`);
    const info = sstdout.split(' ');
    const ref = sstdout.replace(/\r?\n/g, '');

    // ハッシュのブランチ名を取得
    // ( コミットは複数のブランチに含まれるため、完全一致ではない )
    const tmp = execSync(`git branch --contains=${ref} --format=%(refname:short)`);
    if (!tmp || tmp.length < 1 || tmp.indexOf(nowBranch) === -1) return;

    // ２個取れたら出力して終了( 改行なしで出力 )
    printOut.push( tag );
    if( printOut.length === 2 ){
      process.stdout.write(`${printOut[1]} ${printOut[0]}`);
      controller.abort();
      return;
    }
  }
})

controller.abort();
