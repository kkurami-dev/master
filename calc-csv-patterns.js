const fs = require('node:fs');
const path = require('node:path');

const PATTERNS = [
  {
    name: 'pattern1',
    inputFile: 'tmp/Book2.csv',
    outputFile: 'tmp/Book2_calc.csv',
    config: { A1: 1000, A2: 300, A3: 3 },
  },
  {
    name: 'pattern2',
    inputFile: 'tmp/Book3.csv',
    outputFile: 'tmp/Book3_calc.csv',
    config: { A1: 3000, A2: 900, A3: 3 },
  },
  {
    name: 'pattern3',
    inputFile: 'tmp/Book4.csv',
    outputFile: 'tmp/Book4_calc.csv',
    config: { A1: 3000, A2: 900, A3: 20 },
  },
  {
    name: 'pattern4',
    inputFile: 'tmp/Book5.csv',
    outputFile: 'tmp/Book5_calc.csv',
    config: { A1: 1000, A2: 200, A3: 15 },
  },
  {
    name: 'pattern5',
    inputFile: 'tmp/Book6.csv',
    outputFile: 'tmp/Book6_calc.csv',
    config: { A1: 90, A2: 23, A3: 18 },
  },
];

const CALC_POLICY = Object.freeze({
  percentBase: 10 ** 2,
  midRatioNum: 3,
  midRatioDen: 10,
});

const parseCsv = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error('CSVにデータ行がありません。');
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });

  return { headers, rows };
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const compareNumber = (left, right) => (left === right ? 0 : left < right ? -1 : 1);

const shouldUseC1BalanceMode = (A1, A2, A3, E2) =>
  // C1バランスモードを使うべきかを設定値とE2帯域で判定する。
  A2 >= CALC_POLICY.percentBase && E2 < CALC_POLICY.percentBase && A2 * A3 >= A1 * CALC_POLICY.midRatioNum;

const deriveThresholdOffset = (A2, A3) =>
  // A5しきい値算出に使うオフセット値を導出する。
  Math.max(CALC_POLICY.midRatioDen + CALC_POLICY.midRatioNum, Math.ceil((A2 + A3) / CALC_POLICY.midRatioNum));

const deriveThresholdA5 = (A1, A2, thresholdOffset) =>
  // 早期分岐に使うA5しきい値を導出する。
  Math.max(0, Math.min(A1 - thresholdOffset, A1 - A2 + CALC_POLICY.percentBase));

const deriveCutoffs = () => {
  // C1判定で使う高域・中域の閾値をまとめて返す。
  const c1HighCutoff = CALC_POLICY.percentBase;
  const c1MidCutoff = Math.ceil((c1HighCutoff * CALC_POLICY.midRatioNum) / CALC_POLICY.midRatioDen);
  return { c1HighCutoff, c1MidCutoff };
};

function resolveBeforeThreshold(input, context, out) {
  // しきい値未満のケースでC1帯域に応じた固定出力を返す。
  return input.C1 < context.c1HighCutoff ? out(0, 0, context.negE2) : out(0, context.negE2, 0);
}

function resolveHighScale(input, context, out) {
  // E2高域モードの分岐を処理してB2/C2/D2を決定する。
  const { A4, B1, C1 } = input;
  const { E2, c1VsE2, c1HighCutoff, c1MidCutoff, negC1, c1MinusE2, negE2, isC1Zero } = context;

  if (isC1Zero) {
    return out(Math.max(A4 - E2, 0), 0, negE2);
  }
  if (C1 >= c1HighCutoff) {
    return out(0, c1VsE2 < 0 ? E2 : 0, negE2);
  }
  return out(C1 >= c1MidCutoff ? Math.max(-B1, 0) : 0, negC1, c1MinusE2);
}

function resolveBalanceScale(input, context, out) {
  // C1バランスモードでC1とE2の大小関係から出力を決定する。
  const { B1 } = input;
  const { E2, c1VsE2, negC1, c1MinusE2, negE2 } = context;

  if (c1VsE2 < 0) {
    return out(0, negC1, c1MinusE2);
  }
  if (c1VsE2 === 0) {
    return out(Math.max(-B1, 0), negE2, 0);
  }
  return out(0, negE2, 0);
}

function resolveLowScale(input, context, out) {
  // 低スケールモードでB1/C1条件に応じて出力を返す。
  const { B1, C1 } = input;
  const { E2, c1VsE2, negC1, c1MinusE2, negE2, isC1Zero, isC1Positive, isC1LeE2 } = context;

  if (isC1Zero && B1 < 0) {
    return out(B1, 0, negE2);
  }
  if (isC1Positive && isC1LeE2 && B1 < 0) {
    return c1VsE2 === 0 ? out(B1 - (E2 + C1), negC1, 0) : out(0, negC1, c1MinusE2);
  }
  return null;
}

const CALC_MODE_RULES = Object.freeze([
  {
    when: ({ isBeforeThreshold }) => isBeforeThreshold,
    resolve: resolveBeforeThreshold,
  },
  {
    when: ({ E2, c1HighCutoff }) => E2 >= c1HighCutoff,
    resolve: resolveHighScale,
  },
  {
    when: ({ useC1BalanceMode }) => useC1BalanceMode,
    resolve: resolveBalanceScale,
  },
  {
    when: ({ useLowScaleMode }) => useLowScaleMode,
    resolve: resolveLowScale,
  },
]);

/**
 * 判定仕様サマリ
 * 1. E2を ceil(A2 * (A3 / 100)) で算出し、閾値・比較値・既定出力を事前計算する。
 * 2. ルールを上から順に評価し、最初に成立したモードの結果を採用する。
 *    - isBeforeThreshold: A5しきい値未満の早期分岐
 *    - HighScale: E2が高域閾値以上
 *    - BalanceScale: C1バランスモード
 *    - LowScale: 低スケールモード
 * 3. どのモードにも当てはまらない場合は既定式でB2/C2/D2を算出する。
 * 4. 返却値は { B2, C2, D2, E2 }。
 */
function calculateRow(input, config) {
  // 入力と設定から、閾値・モード判定を含む計算コンテキストを構築する。
  const { A5, C1 } = input;
  const { A1, A2, A3 } = config;
  const E2 = Math.ceil(A2 * (A3 / 100));
  const { c1HighCutoff, c1MidCutoff } = deriveCutoffs();
  const thresholdOffset = deriveThresholdOffset(A2, A3);
  const thresholdA5 = deriveThresholdA5(A1, A2, thresholdOffset);
  const negE2 = -E2;
  const negC1 = -C1;
  const c1MinusE2 = C1 - E2;
  const isC1Zero = C1 === 0;
  const isC1Positive = C1 > 0;
  const isC1LeE2 = C1 <= E2;
  const defaultB2 = Math.max(E2 - C1, 0);
  const defaultC2 = -Math.min(Math.max(C1, 0), E2);
  const defaultD2 = -defaultB2;
  const context = {
    E2,
    negE2,
    negC1,
    c1MinusE2,
    isC1Zero,
    isC1Positive,
    isC1LeE2,
    c1VsE2: compareNumber(C1, E2),
    c1HighCutoff,
    c1MidCutoff,
    isBeforeThreshold: A5 < thresholdA5,
    useC1BalanceMode: shouldUseC1BalanceMode(A1, A2, A3, E2),
    useLowScaleMode: A2 < c1HighCutoff && E2 < c1MidCutoff,
    defaultB2,
    defaultC2,
    defaultD2,
  };
  const out = (B2, C2, D2) => ({ B2, C2, D2, E2: context.E2 });

  // ルールを上から順に評価し、最初に成立したモードの結果を返す。
  for (const rule of CALC_MODE_RULES) {
    if (!rule.when(context)) {
      continue;
    }
    const result = rule.resolve(input, context, out);
    if (result) {
      return result;
    }
  }

  // どのモードにも当てはまらない場合は既定ロジックで算出する。
  return out(context.defaultB2, context.defaultC2, context.defaultD2);
}

function buildOutputRows(rows, config) {
  return rows.map((row) => {
    const input = {
      A4: toNumber(row.A4),
      A5: toNumber(row.A5),
      B1: toNumber(row.B1),
      C1: toNumber(row.C1),
    };

    const out = calculateRow(input, config);

    return {
      ...row,
      B2: String(out.B2),
      C2: String(out.C2),
      D2: String(out.D2),
      E2: String(out.E2),
    };
  });
}

function writeCsv(filePath, headers, rows) {
  const line0 = headers.join(',');
  const lines = rows.map((row) => headers.map((h) => row[h] ?? '').join(','));
  fs.writeFileSync(filePath, [line0, ...lines].join('\n'), 'utf8');
}

function compareWithSource(rowsBefore, rowsAfter) {
  let targetRows = 0;
  let matchedRows = 0;

  for (let i = 0; i < rowsBefore.length; i += 1) {
    const src = rowsBefore[i];
    const dst = rowsAfter[i];

    const hasTargets = ['B2', 'C2', 'D2', 'E2'].every((k) => src[k] !== undefined && src[k] !== '');
    if (!hasTargets) {
      continue;
    }

    targetRows += 1;

    if (
      toNumber(src.B2) === toNumber(dst.B2) &&
      toNumber(src.C2) === toNumber(dst.C2) &&
      toNumber(src.D2) === toNumber(dst.D2) &&
      toNumber(src.E2) === toNumber(dst.E2)
    ) {
      matchedRows += 1;
    }
  }

  return { targetRows, matchedRows };
}

function runPattern(pattern) {
  const inputPath = path.resolve(process.cwd(), pattern.inputFile);
  const outputPath = path.resolve(process.cwd(), pattern.outputFile);

  if (!fs.existsSync(inputPath)) {
    console.log(`[skip] ${pattern.inputFile} が見つかりません`);
    return;
  }

  const text = fs.readFileSync(inputPath, 'utf8');
  const { headers, rows } = parseCsv(text);

  const outputHeaders = Array.from(new Set([...headers, 'B2', 'C2', 'D2', 'E2']));
  const outputRows = buildOutputRows(rows, pattern.config);

  writeCsv(outputPath, outputHeaders, outputRows);
  const verifyWithSource = process.env.VERIFY_SOURCE === '1';
  const e2 = Math.ceil(pattern.config.A2 * (pattern.config.A3 / 100));

  console.log(`\n[${pattern.name}] ${pattern.inputFile} -> ${pattern.outputFile}`);
  console.log(`A1=${pattern.config.A1}, A2=${pattern.config.A2}, A3=${pattern.config.A3}`);
  console.log(`E2 = ceil(A2 * (A3/100)) = ceil(${pattern.config.A2} * (${pattern.config.A3}/100)) = ${e2}`);
  if (verifyWithSource) {
    const { targetRows, matchedRows } = compareWithSource(rows, outputRows);
    if (targetRows > 0) {
      console.log(`照合: ${matchedRows}/${targetRows} 行一致`);
    } else {
      console.log('照合: 元CSVにB2,C2,D2,E2が無いためスキップ');
    }
  } else {
    console.log('照合: スキップ (必要なら VERIFY_SOURCE=1 を指定)');
  }
}

const parseCliOptionInt = (name, fallback) => {
  const prefix = `--${name}=`;
  const arg = process.argv.find((v) => v.startsWith(prefix));
  if (!arg) {
    return fallback;
  }
  const n = Number(arg.slice(prefix.length));
  return Number.isInteger(n) && n >= 0 ? n : fallback;
};

const randomInt = (max) => Math.floor(Math.random() * (max + 1));

function runRandomStressTest() {
  const cases = parseCliOptionInt('cases', Number(process.env.STRESS_CASES) || 20000);
  const maxValue = parseCliOptionInt('max', Number(process.env.STRESS_MAX) || 100000);
  let executed = 0;

  for (let i = 0; i < cases; i += 1) {
    const config = {
      A1: randomInt(maxValue),
      A2: randomInt(maxValue),
      A3: randomInt(maxValue),
    };

    const input = {
      A4: randomInt(maxValue),
      A5: randomInt(maxValue),
      B1: randomInt(maxValue),
      C1: randomInt(maxValue),
      D1: randomInt(maxValue),
      E1: randomInt(maxValue),
    };

    const out = calculateRow(input, config);
    const values = [out.B2, out.C2, out.D2, out.E2];

    if (values.some((v) => !Number.isFinite(v) || !Number.isInteger(v))) {
      throw new Error(
        `ランダム耐久テスト失敗: case=${i}, input=${JSON.stringify(input)}, config=${JSON.stringify(config)}, out=${JSON.stringify(out)}`,
      );
    }

    executed += 1;
  }

  console.log(`\n[stress] ${executed} 件のランダムケースを検証しました`);
  console.log('[stress] 条件: 0以上整数入力 / 出力は有限整数');
}

function main() {
  if (process.argv.includes('--stress')) {
    runRandomStressTest();
    return;
  }
  PATTERNS.forEach(runPattern);
}

if (require.main === module) {
  main();
}

module.exports = {
  calculateRow,
  runRandomStressTest,
};
