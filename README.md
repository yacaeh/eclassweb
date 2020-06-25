# E클래스

[![npm](https://img.shields.io/npm/v/rtcmulticonnection.svg)](https://npmjs.org/package/rtcmulticonnection) 

## 설치 가이드

* https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md

```sh
# or clone from github
git clone http://git.ycs.com/ycs/ai/eclassweb.git ./

# install all required packages
# you can optionally include --save-dev
npm install

node server --port=9001

# 또는 pm2 이용 
# pm2 설치
npm install pm2 -g 

# pm2 서버 등록 및 시작 (watch option) 주면 자동 리프레시 기능 활성화
pm2 start --name 서버명 server.js --watch 

# 서버 로그 보기
pm2 log 서버명

```

## 이슈페이지
http://git.ycs.com/ycs/ai/eclassweb/issues

## 위키페이지
http://git.ycs.com/ycs/ai/eclassweb/wikis/%EA%B8%B0%EB%8A%A5