<template>
     <view class="invitee-page">
        <view class="user-box">
            <view class="default-avatar">
                <!-- <image class="default-avatar" :src="`https://api.multiavatar.com/${caller.userID}.svg?apikey=XqHm465NYsdLfb`"></image> -->
                {{ caller?.userName?.substring(0, 1).toLocaleUpperCase() }}
            </view>
            <view class="name">{{ caller?.userName }}</view>
            <view class="inviter-state">来电...</view>
        </view>
        <view class="btn-box">
            <ZegoRefuseInvitationButton :callID="callID" :onPressed="onRefusePressed"></ZegoRefuseInvitationButton>
            <ZegoAcceptInvitationButton :callID="callID" :onPressed="onAcceptPressed"></ZegoAcceptInvitationButton>
        </view>
    </view>
</template>
<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, onUnmounted } from 'vue';
import { ZegoUIKitPrebuiltCall, ZegoUIKitUser, ZegoCallInvitationRole, makePrebuiltListenerID, zploginfo } from "../index";

// 引入 uikit 组件
import ZegoRefuseInvitationButton from '../../zego_uikit/src/components/invitation/ZegoRefuseInvitationButton.vue';
import ZegoAcceptInvitationButton from '../../zego_uikit/src/components/invitation/ZegoAcceptInvitationButton.vue';

const LISTENER_ID = makePrebuiltListenerID() // 生成回调ID
let isJoinRoom = false;
const props = defineProps<{
    callID: string,
    caller?: ZegoUIKitUser,
}>();

onMounted(()=>{
    // 监听uniapp事件
    // @ts-ignore
    // uni.onAppHide(()=>{
    //     zploginfo('[intee page]onAppHide');
    //     // 用户刷新小程序,退出zim（真机不生效）
    //     // PrebuiltCallCore.getInstance().unInit();
    // })
});
onUnmounted(()=>{
    if (!isJoinRoom) {
        // 销毁时不是加入房间时，存在呼叫邀请，清空callid
        // ZegoUIKitPrebuiltCall.leaveRoom();
    }
})

const onAcceptPressed = (res: any) => {
    console.log('[ZegoCallInviteePage]onAcceptPressed', res);
    // 通知业务层
    ZegoUIKitPrebuiltCall.onIncomingCallAcceptButtonPressed();
    if (!res.code) {
        isJoinRoom = true;
    } else {
        // 又取消又接受失败情况下不能直接返回
        // ZegoUIKitPrebuiltCall.navigateBack();
    }
}

const onRefusePressed = (res: any) =>{
    // 通知业务层
    ZegoUIKitPrebuiltCall.onIncomingCallDeclineButtonPressed();
}
</script>
<style scoped>
.invitee-page {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 272rpx 0 90rpx;
    box-sizing: border-box;
    background: #1C1F2E;
    width: 100vw;
    height: 100vh;
    font-family: PingFangSC-Regular;
}
.inviter-state{
    text-align: center;
    font-size: 32rpx;
    color: #A4A4A4;
}
.user-list {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 0 70rpx;
}
.user-box{
    display: flex;
    flex-direction: column;
    align-items: center;
}
.default-avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140rpx;
    height: 140rpx;
	font-weight: 600;
	font-size: 32rpx;
	background-color: #3a3d4a;
	color: #FFFFFF;
	border-radius: 100%;
}
.avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200rpx;
    height: 200rpx;
    background: #333543;
    border-radius: 100%;
}
/* .default-avatar{
    color: #557BFF;
    line-height: 52rpx;
    font-size: 58rpx;
    font-weight: 600;
} */
.name {
    text-align: center;
    margin: 20rpx 0;
    font-size: 42rpx;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 350rpx;
}
.btn-box {
    display: flex;
    justify-content: space-between;
    padding: 0 130rpx;
}
</style>