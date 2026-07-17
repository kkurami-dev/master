

console.log('in background');

// session storage を content script からもアクセス可能にする
chrome.storage.session.setAccessLevel({
  accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'
});
