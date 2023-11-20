# Cypress �Ŏ����e�X�g
����
* https://runebook.dev/ja/docs/cypress/-index-
* https://docs.cypress.io/guides/references/troubleshooting#Support-channels
* https://softwarenote.info/p1454/

�͂��߂�
* https://qiita.com/oh_rusty_nail/items/58dcec335d67e81816dd

## �Z�b�g�A�b�v
    1. ���W���[���̃C���X�g�[��  
       $ npm i -D cypress@9.7.0 cypress-file-upload cypress-wait-until

    2. cypress/support/commands.js �ǉ����W���[���̗��p�ݒ��ǋL
       import 'cypress-file-upload';
       import 'cypress-wait-until';
       
    3. �Ώۂ� URL �� cypress.json �ɋL��
       {
         "baseUrl": "http://localhost:3000"
       }

## �m�F�菇
    1. npm start �Ńe�X�g�Ώۂ��N���i Web �Ȃ�s�v )
    2. npx cypress open �ŋN��
    3. Running integration tests �őS�e�X�g�A�e�X�g�Ώۂ̑I���ŕ����e�X�g
    4. ��肪����ΏC���i�����ōēǍ��A�ăe�X�g�����j

�f�B���N�g���̖���
* cypress.json       : �ݒ���L��(�m�F�Ώۂ� URL�A�e�X�g����̕ۑ�)
* cypress/integration: �e�X�g�R�[�h�̒u���ꏊ
* cypress/fixtures   : �A�b�v���[�h�m�F�p�̃t�@�C���̒u���ꏊ
* cypress/support/commands.js: ���ʂŎg�p���郂�W���[���A�֐��Ȃǂ̋L�ڏꏊ
* cypress/downloads  : �_�E�����[�h�����t�@�C���̒u���ꏊ

## �ŋ߂̎d�l�ύX
* ���i�̔�\���m�F�� .should('not.be.visible') �ł͂Ȃ�.should('not.exist')   
  .should('not.be.visible') �F���i�͑��݂��邪�A�\������Ă��Ȃ�  
  .should('not.exist') �F���݂��Ă��Ȃ�( mui �Ȃǂ͂����� )

* 


## �Q�l�T�C�g
* �����T�C�g�Fhttps://qiita.com/aomoriringo/items/187af32eeac869182648
* �A�b�v���[�h�֘A�Fhttps://engineer-ninaritai.com/cypress-file-upload/
* �_�E�����[�h�֘A�Fhttps://qiita.com/hi-oowada/items/ec692cf03af86d2528ce
* �ݒ�ύX�ȂǁFhttps://runebook.dev/ja/docs/cypress/api/commands/viewport

# React �̏���

## ���W���[���̍폜�i�o�b�N�O�����h�Łj
$ rm -rf ./package-lock.json ; mv node_modules node_modules_back ; rm -rf node_modules_back &  

## ���W���[���̃C���X�g�[��
$ cat ./package.json | jq -r '.dependencies| keys | .[]' | awk '{print "call npm i "$1}' > npm_ins.bat  
$ cat ./package.json | jq -r '.dependencies ' | sed 's/[{}" ]//g' | awk -F: '{print "call npm i "$1"@"$2}'  