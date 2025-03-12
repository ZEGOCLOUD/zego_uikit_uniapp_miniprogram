<template>
    <view>
        <button class="btn" @click="gotoSubPackageWithInvitation">跳转分包（呼叫邀请）</button>
        <button class="btn" @click="gotoSubPackage">跳转分包</button>
    </view>
</template>
<script setup>
import { onMounted } from 'vue';
import { generatePrebuiltTokenTest } from "../../../src/token";
import appConfig from '../../../src/keyCenter.ts';

const APPID = appConfig.APPID;
const SERVER = appConfig.SERVER;
const SERVER_SECRET = appConfig.SERVER_SECRET;

let token = ""; // 您从服务端生成的 Token
const userID = getRandomIndex(); // userID，需用户自己定义，保证全局唯一，建议设置为业务系统中的用户唯一标识
const userName = `wx_${userID}`; // userName 用户名

function getRandomIndex() {
	const randomNumber = Math.floor(Math.random() * 100000); // 生成0到99999的随机整数
	return randomNumber.toString().padStart(5, '0'); // 将数字转换为字符串，并用'0'填充到长度为5
}

const gotoSubPackage = () => {
    console.log('===token', APPID, SERVER_SECRET, userID);
    token = generatePrebuiltTokenTest(APPID, SERVER_SECRET, userID);
    const config = { 
        mode: 1,
        onTokenWillExpire: (roomID) => {
            console.log('[demo]onTokenWillExpire', roomID);
            // 重新获取token
            token = generatePrebuiltTokenTest(APPID, SERVER_SECRET, userID);
            ZegoUIKitPrebuiltCall.renewToken(token, roomID);
        }
    }
    // @ts-ignore
    uni.navigateTo({
        url: `/ZegoUIKitPrebuiltCall/pages/single`,
        success: (res) => { 
            res.eventChannel.emit('acceptDataFromOpenerPage', { APPID, SERVER, token, userID, userName, config })
        },
        fail: () => {
            console.error(`navigateTo fail!`);
        },
        complete: () => { },
    });
}
const gotoSubPackageWithInvitation = () => {
    token = generatePrebuiltTokenTest(APPID, SERVER_SECRET, userID);
    const config = { 
        mode: 2,
        onTokenWillExpire: (roomID) => {
            console.log('[demo]onTokenWillExpire', roomID);
            // 重新获取token
            token = generatePrebuiltTokenTest(APPID, SERVER_SECRET, userID);
            ZegoUIKitPrebuiltCall.renewToken(token, roomID);
        }
    }
   // @ts-ignore
   uni.navigateTo({
       url: `/ZegoUIKitPrebuiltCall/pages/index`,
       success: (res) => { 
           res.eventChannel.emit('acceptDataFromOpenerPage', { APPID, SERVER, token, userID, userName, config })
       },
       fail: () => {
           console.error(`navigateTo fail!`);
       },
       complete: () => { },
   });
}
onMounted(() => {
    console.log('AppConfig:', {
        APPID,
        SERVER,
        SERVER_SECRET
    });
});
</script>
<style scoped>
.btn {
    margin: 50rpx 50rpx 0rpx;
}
</style>