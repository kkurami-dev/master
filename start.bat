:: -*- coding: shift_jis-dos -*-

cd %~dp0

set NODE_ENV=production

call npm i -s npm i react-native-input-spinner

call npm i
call npm start --minify -c --clearCache

exit


-s ���[���A�h���X or �d�b�ԍ��@# url�����ꂼ�ꃁ�[����SMS�ɑ����Ă���܂�
-c                           # �L���b�V�����폜���Ď��s
-m "tunnel" or "lan" or "localhost" # ���s����X�R�[�v��I���ł��܂��B�ڂ����͌ʂ̃I�v�V�����Q��
--tunnel                     # �l�b�g���[�N�̊O������ڑ��ł��܂��B
--lan                        # LAN�����猩��܂�
--localhost                  # ����l�b�g���[�N����̂ݐڑ��ł��܂�
--minify                     # minify���邱�Ƃœ]�����x�������Ȃ�܂�
--dev                        # �ꏏ��chrome��developer�c�[�����J���܂�
--no-dev                     # �J���܂���

* componentWillMount�̖��O��UNSAFE_componentWillMount�ɕύX���āA�񌵖����[�h�ł��̌x����}�����܂��B React 17.x�ł́AUNSAFE_���݂̂��@�\���܂��B �p�~���ꂽ���ׂẴ��C�t�T�C�N���̖��O��V�������O�ɕύX����ɂ́A�v���W�F�N�g�\�[�X�t�H���_�[�� `npx react-codemod rename-unsafe-lifecycles`�����s���܂��B

npx react-codemod rename-unsafe-lifecycles
