let isConverted = false;

chrome.action.onClicked.addListener((tab) => {
  isConverted = !isConverted;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleEpochConvert,
    args: [isConverted]
  });
});

function toggleEpochConvert(toJST) {
  // 画面が壊れるのを防ぐため、テキスト部分だけを安全に走査
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
  let node;

  if (toJST) {
    // 【日本時間に変換】元の値を属性にバックアップして置換
    const textNodes = [];
    while (node = walker.nextNode()) {
      if (/\d{13}/.test(node.nodeValue)) {
        // すでに変換済みの親要素ならスキップ
        if (node.parentElement.closest('[data-epoch-converted]')) continue;
        textNodes.push(node);
      }
    }

    textNodes.forEach(textNode => {
      const originalText = textNode.nodeValue;
      // テキストをepoch部分とそれ以外に分割してDOM要素に置換
      const fragment = document.createDocumentFragment();
      let lastIndex = 0;
      const regex = /\d{13}/g;
      let match;

      while ((match = regex.exec(originalText)) !== null) {
        // epoch前のテキスト
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(originalText.slice(lastIndex, match.index)));
        }
        // 変換した日本時刻を「"」で囲み赤文字のspanで表示
        const jst = new Date(Number(match[0])).toLocaleString('ja-JP');
        const span = document.createElement('span');
        span.style.color = 'red';
        span.style.fontWeight = 'bold';
        span.textContent = '"' + jst + '"';
        span.setAttribute('data-epoch-original', match[0]);
        fragment.appendChild(span);
        lastIndex = regex.lastIndex;
      }

      // 残りのテキスト
      if (lastIndex < originalText.length) {
        fragment.appendChild(document.createTextNode(originalText.slice(lastIndex)));
      }

      // 親要素に変換済みマークを付けて元テキストを保存
      const parent = textNode.parentElement;
      parent.setAttribute('data-epoch-converted', '');
      parent.setAttribute('data-original-epoch', originalText);
      textNode.replaceWith(fragment);
    });
  } else {
    // 【元のエポック秒に戻す】バックアップから復元
    const elements = document.querySelectorAll('[data-epoch-converted]');
    elements.forEach(el => {
      const originalText = el.getAttribute('data-original-epoch');
      // 子要素をすべてクリアして元のテキストノードに戻す
      el.innerHTML = '';
      el.appendChild(document.createTextNode(originalText));
      el.removeAttribute('data-epoch-converted');
      el.removeAttribute('data-original-epoch');
    });
  }
}
