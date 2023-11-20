const TopPath = '/';
let test_num = 0;

function login(id){
  // 共通関数
  cy.log('login', id)
  cy.visit(TopPath);
}

describe('テスト1', function () {
	before(function(){
		// describe() の最初に実行されます。
		// 前処理系を記述します。
    cy.log('before')
    // 複数記載した場合は、記載順番にすべて実行される
	});
	after(function(){
		// describe() の最後に実行されます。
		// 後処理系を記述します。
    // 複数記載した場合は、記載順番にすべて実行される
    cy.log('after')
	});
	beforeEach(function(){
		// 各 it() の前に実行されます。
		// it() 実行のたびに行いたい前処理系を記述します。
    // 複数記載した場合は、記載順番にすべて実行される
    cy.log('beforeEach', test_num);
    //cy.visit('/');
    login('aa');
	});
	afterEach(function(){
		// 各 it() の後に実行されます。
		// it() 実行のたびに行いたい後処理系を記述します。
    // 複数記載した場合は、記載順番にすべて実行される
    cy.log('afterEach');
	});

	// it("テストタイトル(最初, before() が動作)", function(){
	// 	// ここにテスト内容を記述します。beforeEach() が動作した後に、下記が実行される
  //   test_num++;
  //   cy.log('if 1');
  //   // 最後に afterEach() が動作する
	// });

  // it('id属性で合成ボタン2を押す', () => {
  //   test_num++;
  //   let btn = cy.get('#btn-concat2');
  // });

  // it('name属性で合成ボタン3を押す', () => {
  //   test_num++;
  //   let btn = cy.get('button[name="btn-concat3"]');
  // });

  it('ダウンロードテスト', () => {
    cy.get('#download_xlsx').click();

    const filename = 'cypress/downloads/sampleData.xlsx';
    cy.readFile(filename, 'binary').then(buffer => {
      expect(buffer.length).to.be.gt(1000);
    });

    cy.get('#xlsx-input').attachFile("../downloads/sampleData.xlsx")
  });

  // it('ダイアログが消えた後にドロップダウンリストの選択', () => {
  //   cy.get('#modal-modal-title').should('not.exist');//非表示確認
  //   cy.get('#btn-concat1').click();// 処理中ダイアログ表示
  //   cy.get('#modal-modal-title', {timeout: 20000}).should('not.exist')//非表示確認
  //   cy.get('#demo-simple-select').click();
  //   cy.get('[data-value="20"]').click()
  // });

  // it('アップロードテスト(固定ファイル)', () => {
  //   test_num++;
  //   cy.get('#img-input').attachFile('box-img-sm.png')
  //   cy.screenshot(); // スクリーンショット
  // });

  // it('アップロードテスト(固定複数ファイル)', () => {
  //   test_num++;
  //   cy.get('#img-input').attachFile(['box-img-sm2.png', 'box-img-sm.png'])
  //   cy.screenshot(); // スクリーンショット
  // });

  // it('アップロードテスト(ダウンロードしたファイル)', () => {
  //   test_num++;
  //   cy.get('#btn-concat1').click();
  // });

  // it('別ページ確認', () => {
  //   test_num++;
  //   cy.get('#btn-concat1').click();
  // });

	// it("テストタイトル(最後 after() が動作)", function(){
  //   cy.log('if 3')
	// });
});

// describe('テスト2', function () {
// 	before(function(){
//     cy.log('before 2');
//     test_num = 0;
//     login();
// 	});
//   /* なくてもよい
// 	  after(function(){
// 	  });
// 	  beforeEach(function(){
// 	  });
// 	  afterEach(function(){
// 	  });
//   */

// 	it("テストタイトル(最初)", function(){
//     test_num++;
//     cy.log('if 1', test_num)
// 	});

//   it('合成ボタンを押す', () => {
//     test_num++;
//     cy.get('#btn-concat1').click();
//   });

// 	it("テストタイトル(最後)", function(){
//     test_num++;
//     cy.log('if 3', test_num)
// 	});
// });
